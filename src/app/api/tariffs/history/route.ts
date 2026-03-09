export async function GET(request: Request) {
  void request;
  return Response.json(
    {
      error: "history_not_available",
      message: "Historical tariff revisions are not published yet."
    },
    { status: 501 }
  );
}
