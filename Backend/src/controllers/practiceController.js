import PracticeSession from "../models/practiceSessionModel.js";
import {
	getSubjectPool,
	SUBJECTS,
} from "../service/assessmentQuestionProvider.js";
import { evaluateRecording } from "../service/geminiEvaluationService.js";
import {
	uploadRecordingToCloudinary,
} from "../config/cloudinary.js";
import { applyPracticeStreak } from "../service/streakService.js";

const SCORE_FIELDS = [
	"relevance",
	"contentAccuracy",
	"completeness",
	"clarity",
	"grammar",
	"vocabulary",
	"fluency",
	"confidence",
];

const sendData = (res, data, statusCode = 200) =>
	res.status(statusCode).json({ success: true, data });

const badRequest = (message, statusCode = 400) => {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
};

const getDailyQuestion = () => {
	const subject = SUBJECTS[0];
	const pool = getSubjectPool(subject);
	const dayNumber = Math.floor(Date.now() / 86400000);
	return pool[dayNumber % pool.length];
};

export const getTodayQuestion = (req, res, next) => {
	try {
		const question = getDailyQuestion();
		return sendData(res, {
			subject: question.subject,
			topic: question.topic,
			question: question.question,
		});
	} catch (error) {
		return next(error);
	}
};

export const analyzeRecording = async (req, res, next) => {
	try {
		const { question, subject, topic, mode, recordedDuration } = req.body;
		const file = req.files?.[mode === "video" ? "video" : "audio"]?.[0];

		if (!question?.trim()) {
			throw badRequest("A practice question is required.");
		}

		if (!["speaking", "video"].includes(mode)) {
			throw badRequest("Mode must be either speaking or video.");
		}

		if (!file) {
			throw badRequest(`Please provide a ${mode === "video" ? "video" : "audio"} recording.`);
		}

		const duration = Number(recordedDuration);
		if (!Number.isFinite(duration) || duration < 1) {
			throw badRequest("Recording duration must be at least one second.");
		}

		const evaluation = await evaluateRecording({
			buffer: file.buffer,
			mimeType:
				["text/plain", "application/octet-stream"].includes(file.mimetype)
					? mode === "video"
						? "video/webm"
						: "audio/webm"
					: file.mimetype,
			question: question.trim(),
			mode,
		});

		const upload = await uploadRecordingToCloudinary(file);
		const session = await PracticeSession.create({
			user: req.user._id,
			subject: subject?.trim() || "General",
			topic: topic?.trim() || "",
			question: question.trim(),
			mode,
			transcript: evaluation.transcript,
			duration: Math.round(duration),
			overallScore: evaluation.overallScore,
			breakdown: Object.fromEntries(
				[...SCORE_FIELDS, "fillerWords"].map((field) => [field, evaluation[field]])
			),
			feedback: evaluation.feedback,
			strengths: evaluation.strengths,
			improvements: evaluation.improvements,
			nextPractice: evaluation.nextPractice,
			recordingUrl: upload.secure_url || upload.url || "",
		});

		const streak = applyPracticeStreak(req.user);
		await req.user.save();

		return sendData(res, { ...session.toObject(), id: session._id, streak }, 201);
	} catch (error) {
		return next(error);
	}
};

export const getHistory = async (req, res, next) => {
	try {
		const filter = { user: req.user._id };
		if (req.query.mode) {
			if (!["speaking", "video"].includes(req.query.mode)) {
				throw badRequest("Mode must be either speaking or video.");
			}
			filter.mode = req.query.mode;
		}

		const sessions = await PracticeSession.find(filter)
			.sort({ createdAt: -1 })
			.limit(100)
			.select("subject topic mode duration overallScore createdAt");

		return sendData(res, { sessions });
	} catch (error) {
		return next(error);
	}
};

export const getStats = async (req, res, next) => {
	try {
		const [summary] = await PracticeSession.aggregate([
			{ $match: { user: req.user._id } },
			{
				$group: {
					_id: null,
					totalSessions: { $sum: 1 },
					averageScore: { $avg: "$overallScore" },
					bestScore: { $max: "$overallScore" },
				},
			},
		]);

		return sendData(res, {
			totalSessions: summary?.totalSessions || 0,
			averageScore: summary ? Math.round(summary.averageScore) : 0,
			bestScore: summary?.bestScore || 0,
			currentStreak: req.user.streak || 0,
			longestStreak: req.user.longestStreak || 0,
		});
	} catch (error) {
		return next(error);
	}
};

export const getOne = async (req, res, next) => {
	try {
		const session = await PracticeSession.findOne({
			_id: req.params.id,
			user: req.user._id,
		});

		if (!session) {
			throw badRequest("Practice result not found.", 404);
		}

		return sendData(res, { session });
	} catch (error) {
		return next(error);
	}
};
