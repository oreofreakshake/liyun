import { WorkspaceLoader } from "./workspace-loader";

const demoHtml = [
  "<h1>ބައްދަލުވުން (Meeting 2026) ހުޅުވާލި</h1>",
  "<p>iPhone 17 ވިއްކަން ފަށައިފި</p>",
  "<p>ތަރައްގީ 50% އަށް އިތުރުވި</p>",
  "<p>ޓިކެޓުގެ އަގަކީ $150 އެވެ.</p>",
  "<p>ގަވާއިދު ނަންބަރު 2023/R-105 ގެ ދަށުން</p>",
  '<p>ރައީސް ވިދާޅުވީ "Welcome to Maldives!" މިހެންނެވެ.</p>',
  "<p>ގުޅުއްވާނީ +960 333 4444 އަށް</p>",
  "<p>The word ރާއްޖެ means Maldives.</p>",
].join("");

export default function WritePage() {
  return <WorkspaceLoader demoHtml={demoHtml} />;
}
