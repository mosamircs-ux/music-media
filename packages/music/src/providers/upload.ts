import { UserUploadMusicProvider } from "./user-upload";

// Backward compatibility class export
export class UploadMusicProvider extends UserUploadMusicProvider {
  override readonly id = "upload" as const;
  override readonly name = "User Upload Provider";
}
