import { NextResponse, type NextRequest } from "next/server";
import { ProjectSchema } from "@musicmotion/shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ProjectSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid project payload", errors: validated.error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      project: validated.data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project", details: String(error) },
      { status: 500 }
    );
  }
}
