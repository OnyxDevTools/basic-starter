import { createTasks } from "../lib/onyx/tasks.ts";

const [operation, value, text, completed] = process.argv.slice(2);
try {
  const tasks = createTasks();
  switch (operation) {
    case "list":
      console.log(JSON.stringify(await tasks.list(value), null, 2));
      break;
    case "get":
      console.log(JSON.stringify(await tasks.get(value || ""), null, 2));
      break;
    case "create":
      console.log(JSON.stringify(await tasks.create(value || ""), null, 2));
      break;
    case "update":
      if (completed !== "true" && completed !== "false")
        throw new Error("Use true or false for completed.");
      if (!(await tasks.update(value || "", text || "", completed === "true")))
        throw new Error("Task not found.");
      console.log("Task updated.");
      break;
    case "delete":
      if (!(await tasks.remove(value || "")))
        throw new Error("Task not found.");
      console.log("Task deleted.");
      break;
    default:
      throw new Error(
        "Use list [cursor], get <id>, create <title>, update <id> <title> <true|false>, or delete <id>.",
      );
  }
} catch {
  // Never print SDK errors: they can include credentials or request payloads.
  console.error(
    "Task command failed. Check command arguments, downloaded Onyx configuration, database availability, and schema.",
  );
  process.exitCode = 1;
}
