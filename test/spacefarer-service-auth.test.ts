import cds from "@sap/cds";

const ADMIN_AUTH = { username: "admin", password: "admin" };
const KEPLER_AUTH = { username: "kepler", password: "kepler" };
const MARTIAN_AUTH = { username: "martian", password: "martian" };

describe("Spacefarer Service Authentication", () => {
  const { GET, POST, expect, defaults } = cds.test(__dirname + "/..");
  const SPACEFARERS_PATH = "/odata/v4/spacefarer/Spacefarers";
  defaults.auth = ADMIN_AUTH;

  let keplerSpacefarerId: string;
  let marsSpacefarerId: string;

  beforeAll(async () => {
    const kepler = await POST(SPACEFARERS_PATH, {
      name: "Kepler Native",
      originPlanet: "Kepler-22b",
      stardustCollection: 5,
    });
    keplerSpacefarerId = kepler.data.ID;

    const mars = await POST(SPACEFARERS_PATH, {
      name: "Mars Native",
      originPlanet: "Mars",
      stardustCollection: 5,
    });
    marsSpacefarerId = mars.data.ID;
  });

  it("rejects requests with invalid credentials", async () => {
    const originalAuth = defaults.auth;
    defaults.auth = undefined;
    const res = await GET(SPACEFARERS_PATH).catch((err: any) => err.response);

    defaults.auth = originalAuth;
    expect(res.status).to.equal(401);
  });

  it("lets SpacefarerAdmin access all spacefarer data", async () => {
    const { data } = await GET(SPACEFARERS_PATH, { auth: ADMIN_AUTH });

    const planets = data.value.map((s: any) => s.originPlanet);
    expect(planets).to.include("Kepler-22b");
    expect(planets).to.include("Mars");
  });

  it("lets martian access their own spacefarer data", async () => {
    const { data } = await GET(SPACEFARERS_PATH, { auth: MARTIAN_AUTH });

    expect(data.value.length).to.be.greaterThan(0);
    expect(data.value.every((s: any) => s.originPlanet === "Mars")).to.equal(
      true,
    );
  });

  it("lets kepler access their own spacefarer data", async () => {
    const { data } = await GET(SPACEFARERS_PATH, { auth: KEPLER_AUTH });

    expect(data.value.length).to.be.greaterThan(0);
    expect(
      data.value.every((s: any) => s.originPlanet === "Kepler-22b"),
    ).to.equal(true);
  });

  it("hides a Mars spacefarer from kepler via direct key read (404, not 403)", async () => {
    const res = await GET(`${SPACEFARERS_PATH}(${marsSpacefarerId})`, {
      auth: KEPLER_AUTH,
    }).catch((err: any) => err.response);

    expect(res.status).to.equal(404);
  });

  it("hides a Kepler spacefarer from martian via direct key read (404, not 403)", async () => {
    const res = await GET(`${SPACEFARERS_PATH}(${keplerSpacefarerId})`, {
      auth: MARTIAN_AUTH,
    }).catch((err: any) => err.response);

    expect(res.status).to.equal(404);
  });

  it("forbids a non-admin user from creating a spacefarer", async () => {
    const res = await POST(
      SPACEFARERS_PATH,
      { name: "Unauthorized Recruit", originPlanet: "Kepler-22b" },
      { auth: KEPLER_AUTH },
    ).catch((err: any) => err.response);

    expect(res.status).to.equal(403);
  });
});
