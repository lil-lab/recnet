import { Module } from "@nestjs/common";

import { PhotoStorageController } from "./photo-storage.controller";
import { PhotoStorageService } from "./photo-storage.service";

@Module({
  controllers: [PhotoStorageController],
  providers: [PhotoStorageService],
})
export class PhotoStorageModule {}
