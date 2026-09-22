import cds from "@sap/cds";

jest.mock("../srv/lib/mailer", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue("mocked-preview-url"),
}));

describe("Spacefarer Service", () => {
  const { POST, expect, defaults } = cds.test(
    __dirname + "/..",
    "--profile",
    "test",
  );

  const SPACEFARERS_PATH = "/odata/v4/spacefarer/Spacefarers";
  defaults.auth = { username: "admin", password: "admin" };

  async function activateDraft(id: string) {
    const key = `ID=${id},IsActiveEntity=false`; // Edm.Guid key — no quotes
    return POST(
      `${SPACEFARERS_PATH}(${key})/SpacefarerService.draftActivate`,
      {},
    ).catch((err: any) => err.response);
  }

  it("rejects a spacefarer with negative startdust collection", async () => {
    const draft = await POST(SPACEFARERS_PATH, {
      name: "Test Spacefarer",
      stardustCollection: -10,
    }).catch((err: any) => err.response);

    const response = await activateDraft(draft.data.ID);

    expect(response.status).to.equal(400);
  });

  it("rejects a spacefarer with wormhole navigation skill out of range", async () => {
    const draft = await POST(SPACEFARERS_PATH, {
      name: "Test Spacefarer",
      wormholeNavSkill: 11,
    }).catch((err: any) => err.response);

    const response = await activateDraft(draft.data.ID);

    expect(response.status).to.equal(400);
  });

  it("applies the stardust welcome bonus on create", async () => {
    const draft = await POST(SPACEFARERS_PATH, {
      name: "Test Spacefarer",
      stardustCollection: 20,
    });

    const response = await activateDraft(draft.data.ID);

    expect(response.status).to.equal(201);
    expect(response.data.stardustCollection).to.equal(30);
  });

  it("defaults wormhole nav skill when not declared", async () => {
    const draft = await POST(SPACEFARERS_PATH, {
      name: "Test Spacefarer",
    });

    const response = await activateDraft(draft.data.ID);

    expect(response.status).to.equal(201);
    expect(response.data.wormholeNavSkill).to.equal(1);
  });
});
