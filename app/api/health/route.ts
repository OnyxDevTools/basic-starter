import project from "../../../project.json";

export function GET() {
  return Response.json({ application: project.slug, status: "ok" });
}
