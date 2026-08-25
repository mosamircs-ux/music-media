import { LicensedMusicProvider } from "./licensed";

// Backward compatibility class export
export class JamendoMusicProvider extends LicensedMusicProvider {
  override readonly id = "jamendo" as const;
  override readonly name = "Jamendo Licensing API";
}
