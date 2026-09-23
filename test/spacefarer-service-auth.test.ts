import { Spacefarer } from "#cds-models/SpacefarerService";
import cds from "@sap/cds";

jest.mock("../srv/lib/mailer", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue("mocked-preview-url"),
}));

const ADMIN_AUTH = { username: "admin", password: "admin" };
const KEPLER_AUTH = { username: "kepler", password: "kepler" };
const MARTIAN_AUTH = { username: "martian", password: "martian" };
const SPACEFARERS_PATH = "/odata/v4/spacefarer/Spacefarers";
const NAMESPACE = "SpacefarerService";

const { GET, POST, PATCH, DELETE, expect, defaults } = cds.test(
  __dirname + "/..",
  "--profile",
  "test",
);

describe("Spacefarer Service Authentication", () => {
  defaults.auth = ADMIN_AUTH;

  let keplerSpacefarerId: string;
  let marsSpacefarerId: string;

  beforeAll(async () => {
    keplerSpacefarerId = await createSpacefarer({
      name: "Kepler Native",
      originPlanet: "Kepler-22b",
      stardustCollection: 5,
    });
    marsSpacefarerId = await createSpacefarer({
      name: "Mars Native",
      originPlanet: "Mars",
      stardustCollection: 5,
    });
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
    const res = await GET(getActiveKey(marsSpacefarerId), {
      auth: KEPLER_AUTH,
    }).catch((err: any) => err.response);

    expect(res.status).to.equal(404);
  });

  it("hides a Kepler spacefarer from martian via direct key read (404, not 403)", async () => {
    const res = await GET(getActiveKey(keplerSpacefarerId), {
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

  it("marks locked fields read-only for non-admins and editable for admins", async () => {
    const asKepler = await GET(getActiveKey(keplerSpacefarerId), {
      auth: KEPLER_AUTH,
    });
    const asAdmin = await GET(getActiveKey(keplerSpacefarerId), {
      auth: ADMIN_AUTH,
    });

    expect(asKepler.data.lockedFieldControl).to.equal(1);
    expect(asAdmin.data.lockedFieldControl).to.equal(3);
  });
});

describe("Spacefarer Service Edit Actions", () => {
  const newKeplerSpacefarer = () =>
    createSpacefarer({
      name: "Kepler Editable",
      originPlanet: "Kepler-22b",
      stardustCollection: 5,
    });

  it("lets kepler edit stardust collection and spacesuit color on a Kepler-22b spacefarer", async () => {
    const id = await newKeplerSpacefarer();

    await editSpacefarer(
      id,
      { stardustCollection: 42, spacesuitColor: "Teal" },
      KEPLER_AUTH,
    );

    const { data } = await GET(getActiveKey(id), { auth: KEPLER_AUTH });
    expect(data.stardustCollection).to.equal(42);
    expect(data.spacesuitColor).to.equal("Teal");
  });

  it.each([
    ["name", { name: "Renamed" }],
    ["originPlanet", { originPlanet: "Mars" }],
    ["wormholeNavSkill", { wormholeNavSkill: 9 }],
  ])("forbids kepler from changing %s", async (field, changes) => {
    const id = await newKeplerSpacefarer();

    const res = await editSpacefarer(id, changes, KEPLER_AUTH).catch(
      (err: any) => err.response,
    );
    expect(res.status).to.equal(403);

    const { data } = await GET(getActiveKey(id), { auth: ADMIN_AUTH });
    expect(data[field]).to.not.equal((changes as any)[field]);
  });

  it("lets SpacefarerAdmin change locked fields", async () => {
    const id = await newKeplerSpacefarer();

    await editSpacefarer(
      id,
      { name: "Admin Renamed", wormholeNavSkill: 9 },
      ADMIN_AUTH,
    );

    const { data } = await GET(getActiveKey(id), { auth: ADMIN_AUTH });
    expect(data.name).to.equal("Admin Renamed");
  });

  it("forbids martian from editing a Kepler-22b spacefarer", async () => {
    const id = await newKeplerSpacefarer();

    const res = await POST(
      `${getActiveKey(id)}/${NAMESPACE}.draftEdit`,
      { PreserveChanges: true },
      { auth: MARTIAN_AUTH },
    ).catch((err: any) => err.response);

    expect(res.status).to.be.oneOf([403, 404]);
  });

  it("forbids a non-admin user from deleting a spacefarer", async () => {
    const id = await newKeplerSpacefarer();

    const res = await DELETE(getActiveKey(id), { auth: KEPLER_AUTH }).catch(
      (err: any) => err.response,
    );
    expect(res.status).to.equal(403);
  });
});

async function createSpacefarer(data: Partial<Spacefarer>) {
  const { data: draft } = await POST(SPACEFARERS_PATH, data, {
    auth: ADMIN_AUTH,
  });
  await POST(
    `${getDraftKey(draft.ID)}/${NAMESPACE}.draftActivate`,
    {},
    { auth: ADMIN_AUTH },
  );
  return draft.ID;
}

async function editSpacefarer(
  id: string,
  data: Partial<Spacefarer>,
  auth: typeof ADMIN_AUTH,
) {
  await POST(
    `${getActiveKey(id)}/${NAMESPACE}.draftEdit`,
    { PreserveChanges: true },
    { auth },
  );
  await PATCH(getDraftKey(id), data, { auth });
  return POST(`${getDraftKey(id)}/${NAMESPACE}.draftActivate`, {}, { auth });
}

function getActiveKey(id: string): string {
  return `${SPACEFARERS_PATH}(ID=${id},IsActiveEntity=true)`;
}

function getDraftKey(id: string): string {
  return `${SPACEFARERS_PATH}(ID=${id},IsActiveEntity=false)`;
}
