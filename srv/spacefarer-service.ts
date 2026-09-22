import cds, { Request } from "@sap/cds";
import { Spacefarer, Spacefarers } from "#cds-models/SpacefarerService";
import { sendWelcomeEmail } from "./lib/mailer";

export class SpacefarerService extends cds.ApplicationService {
  async init() {
    this.before("CREATE", "Spacefarers", this.onBeforeCreateSpacefarer);
    this.after("CREATE", "Spacefarers", this.onAfterCreateSpacefarer);

    return super.init();
  }

  private onBeforeCreateSpacefarer(req: Request<Spacefarer>) {
    const { stardustCollection, wormholeNavSkill } = req.data;

    if (stardustCollection != null && stardustCollection < 0) {
      req.error(400, "stardustCollection must be non-negative");
    }

    if (
      wormholeNavSkill != null &&
      (wormholeNavSkill < 0 || wormholeNavSkill > 10)
    ) {
      req.error(400, "wormholeNavSkill must be between 0 and 10");
    }

    Object.assign(req.data, {
      // Enhance the rookie spacefarers stardust collection by adding a bonus of 10
      stardustCollection: (stardustCollection ?? 0) + 10,
      // Set the initial wormhole navigation skill to 1 if not provided
      wormholeNavSkill: wormholeNavSkill ?? 1,
    });
  }

  private async onAfterCreateSpacefarer(data: Spacefarers, req: Request) {
    if (data.length === 1) {
      const [{ ID, name, originPlanet }] = data;

      try {
        const previewUrl = await sendWelcomeEmail({ name, originPlanet });

        console.log(
          `[SpacefarerService] Welcome email sent for spacefarer ${ID}: ${previewUrl}`,
        );
      } catch (error) {
        console.error(
          "[SpacefarerService] Failed to send welcome email",
          error,
        );
      }
    }
  }
}
