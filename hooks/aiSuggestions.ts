// // 🧠 AI Suggestion placeholder (Phase 2)
// // This will later integrate with OpenAI to auto-suggest task priority,
// // due date, or description improvements.

// export async function suggestPriority(title: string): Promise<number> {
//   // For now, return Medium priority for all tasks
//   // In future: call your FlowOS API → /ai/suggestPriority or OpenAI endpoint
//   console.log("🤖 [AI Placeholder] Suggesting priority for:", title);

//   // TODO: integrate GPT model suggestion logic here (Week 5+)
//   return 2; // 1 = Low, 2 = Medium, 3 = High
// }

// export async function summarizeTasks(titles: string[]): Promise<string> {
//   // Example placeholder summary
//   console.log("🤖 [AI Placeholder] Summarizing tasks:", titles);
//   return "You have " + titles.length + " tasks today. Stay productive!";
// }

// 🧠 AI Suggestion placeholder (Phase 2)
// This will later integrate with OpenAI to auto-suggest task priority,
// due date, or description improvements.

export async function suggestPriority(title: string): Promise<number> {
  console.log("🤖 [AI Placeholder] Suggesting priority for:", title);

  // Simulate short AI "thinking" delay for UX
  await new Promise((res) => setTimeout(res, 100));  
  //await new Promise((res) => setTimeout(res, 400));

  const text = title.toLowerCase();

  // 🔥 Simple keyword-based mock logic for now
  if (text.includes("urgent") || text.includes("asap") || text.includes("today") || text.includes("important")) {
    return 3; // High
  }
  if (text.includes("meeting") || text.includes("review") || text.includes("submit") || text.includes("email") ||
     text.includes("call") || text.includes("follow up") || text.includes("plan") || text.includes("schedule")) {
    return 2; // Medium
  }
  if (text.includes("idea") || text.includes("later") || text.includes("note") || text.includes("explore")) {
    return 1; // Low
  }

  // Default fallback
  return -1; // 1 = Low, 2 = Medium, 3 = High
}

// 🧩 Future Expansion
// In future (Week 5+), integrate GPT / FlowOS API endpoint:
//   const res = await api.post("/ai/suggestPriority", { title });
//   return res.data.priority;

export async function summarizeTasks(titles: string[]): Promise<string> {
  // Example placeholder summary
  console.log("🤖 [AI Placeholder] Summarizing tasks:", titles);
  return "You have " + titles.length + " tasks today. Stay productive!";
}
