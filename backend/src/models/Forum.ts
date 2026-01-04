import mongoose, { Schema, Document } from "mongoose";

export interface IForumComment {
  content: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IForum extends Document {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  comments: IForumComment[];
  createdAt: Date;
}

const ForumCommentSchema = new Schema<IForumComment>({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const ForumSchema = new Schema<IForum>({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comments: [ForumCommentSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IForum>("Forum", ForumSchema);
