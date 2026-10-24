import type { Template } from "editor";
import invoice from "../templates/invoice.json";
import meetingMinutes from "../templates/meeting-minutes.json";
import memo from "../templates/memo.json";
import newsArticle from "../templates/news-article.json";
import officialLetter from "../templates/official-letter.json";

export const templates = [
  officialLetter,
  memo,
  meetingMinutes,
  invoice,
  newsArticle,
] as Template[];
