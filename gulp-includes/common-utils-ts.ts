import path from "path";
import log from "fancy-log";
import {ExtensionManifest, ExtensionManifestPackaging} from "../lib/utils/types/opexdk.types";

export const cu = {

  getExtSkeletonsAbsPath: function () {
    console.log("dirname: ", __dirname);
    const s = path.resolve(__dirname, "../assets/extension_skeletons");
    console.log("ExtSkeletonsAbsPath: ", s);
    return s;
  },

  getDistSkeletonAbsPath: function () {
    console.log("dirname: ", __dirname);
    const s = path.resolve(__dirname, "../assets/dist_skel");
    console.log("DistSkeletonPath: ", s);
    return s;
  },

  /**
   * @deprecated
   * @see buildPublicNameOfDelivery2
   */
  getPublicNameOfDelivery: function (extension: ExtensionManifestPackaging, args: any) {

    /*
     *
     */
    let adminFolderSuffix = "";
    if (args.admin) {
      console.log("★ Admin folder: " + args.admin);
      adminFolderSuffix = "-" + args.admin;
    }

    /*
     *
     */
    return extension.finalName + '-version-' + extension.version + adminFolderSuffix;
  },

  buildPublicNameOfDelivery: function (extension: ExtensionManifestPackaging, suffix?: string) {
    return [extension.finalName, "version", extension.version, suffix].filter(Boolean).join("-");
  },

  /**
   * This is the output directory when opexdk will pack the extension.
   * Use OPEX_OUTPUT_DIR env variable if provided, otherwise defaults to /tmp/opexdk-output
   */
  getOutputDirAbsPath: function () {
    if (process.env.OPEXDK_OUTPUT_DIR) {
      return process.env.OPEXDK_OUTPUT_DIR;
    } else {
      const os = require('os');
      return path.join(os.tmpdir(), "opexdk-output");
    }
  },

  getBuildDirAbsPath: function () {
    return path.join(this.getOutputDirAbsPath(), "build");
  },

  getDistDirAbsPath: function () {
    return path.join(this.getOutputDirAbsPath(), "dist");
  },

  getZipsDirAbsPath: function () {
    return path.join(this.getOutputDirAbsPath(), "zips");
  },

  /**
   * @deprecated
   * @see buildPathToExtensionBuildFolder
   */
  getPathToExtensionBuildFolder: function (extensionFinalName: string, extension: { private_build_dir: string; }) {
    return path.join(this.getBuildDirAbsPath(), extension.private_build_dir, extensionFinalName);
  },
  buildPathToExtensionBuildFolder: function (extensionFinalName: string, private_build_dir: string | undefined) {
    return path.join(this.getBuildDirAbsPath(), private_build_dir || "", extensionFinalName);
  },


  /**
   * @deprecated
   * @see getPathToExtensionDistFolder2
   */
  getPathToExtensionDistFolder: function (extensionFinalName: any, extension: { private_dist_dir: any; }) {
    return path.join(this.getDistDirAbsPath(), `${extension.private_dist_dir}/${extensionFinalName}`);
  },

  getPathToExtensionDistFolder2: function (extensionFinalName: string, private_dist_dir: string) {
    return path.join(this.getDistDirAbsPath(), `${private_dist_dir}/${extensionFinalName}`);
  },

  getPathToExtensionOcmodDistFolder: function (extensionFinalName: any, extension: any) {
    return this.getPathToExtensionDistFolder(extensionFinalName, extension) + "/ocmod-oneclick-install";
  },


  getPathToExtensionLegacyDistFolder: function (extensionFinalName: any, extension: any) {
    return this.getPathToExtensionDistFolder(extensionFinalName, extension) + "/vqmod-legacy-install";
  },

  getNameOfFullZip : function (finalName: string) {
    return `${finalName}.full.zip`;
  },
  getNameOfCloudZip: function (finalName: string) {
    return `${finalName}.cloud.nodoc.ocmod.zip`;
  },

  /**
   *
   */
  getExtensionAndDepsDirs: function (extension: ExtensionManifestPackaging) {

    /*
     *
     */
    if (!extension.dependencies) {
      return [extension.dir];  //arr
    }

    /*
     *
     */
    const result    = [];

    extension.dependencies.forEach(function (depDirName) {
      console.log("★ Dep is: ", depDirName);

      if (depDirName.indexOf('!') >= 0) {
        console.log("★ dep contains `!`. Ignoring!");
        return;
      }

      let dependencyManifest = require('../my-helpers/extension-manifest-loader').loadManifest({
        "m": path.basename(depDirName)
      });

      console.log("★ extensionManifest of dependency was loaded: ", dependencyManifest);
      if (dependencyManifest.dependencies) {
        let deps = module.exports.getExtensionAndDepsDirs(dependencyManifest);
        result.push(...deps);
      } else {
        // let libAbsDir = path.join(parentDir, depDirName);
        let libAbsDir = dependencyManifest.dir;
        result.push(libAbsDir);
      }

    });

    result.push(extension.dir);
    return result;
  },


  addSuffixToDirs: function (dirs: any[], suffix: any) {

    const result = [];

    dirs.forEach(function (dir) {
      result.push(dir + suffix);
    });

    return result;
  },


  getPathToVhost: function (manifest: ExtensionManifest, args: any) {
    let ocFolder: string;
    if (args.o) {
      ocFolder = args.o;
    } else if (manifest.devSpec && manifest.devSpec.watchTask && manifest.devSpec.watchTask.defaultTarget) {
      ocFolder = manifest.devSpec.watchTask.defaultTarget;
    }

    if (ocFolder) {
      return path.join(process.env.OPEXDK_VHOST_PATH, ocFolder);
    } else {
      log.error("Please specify -o flag or defaultTarget in extension manifest!");
    }
  }
}