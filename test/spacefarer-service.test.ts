import cds from "@sap/cds";

describe("Spacefarer Service", () => {
  const { POST, expect, defaults } = cds.test(__dirname + "/..");
  const SPACEFARERS_PATH = "/odata/v4/spacefarer/Spacefarers";
  defaults.auth = { username: "admin", password: "admin" };

  it("rejects a spacefarer with negative startdust collection", async () => {
    const response = await POST(SPACEFARERS_PATH, {
      name: "Test Spacefarer",
      stardustCollection: -10,
    }).catch((err: any) => err.response);

    expect(response.status).to.equal(400);
  });

  it("rejects a spacefarer with wormhole navigation skill out of range", async () => {
    const response = await POST(SPACEFARERS_PATH, {
      name: "Test Spacefarer",
      wormholeNavSkill: 11,
    }).catch((err: any) => err.response);

    expect(response.status).to.equal(400);
  });

  it("applies the stardust welcome bonus on create", async () => {
    const response = await POST(SPACEFARERS_PATH, {
      name: "Test Spacefarer",
      stardustCollection: 20,
    });

    expect(response.status).to.equal(201);
    expect(response.data.stardustCollection).to.equal(30);
  });

  it("defaults wormhole nav skill when not declared", async () => {
    const response = await POST(SPACEFARERS_PATH, {
      name: "Test Spacefarer",
    });

    expect(response.status).to.equal(201);
    expect(response.data.wormholeNavSkill).to.equal(1);
  });
});
