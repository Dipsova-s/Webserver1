using EveryAngle.Core.ViewModels.VideoPlayer;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace EveryAngle.WebClient.Web.Helpers
{
    public static class VideoHelper
    {
        public const string VideoDefaultLanguage = "en";
        public const string VideoResourcePath = "/Resources/Movies/";

        public static bool TryParseVideoDirectory(string videoServerPath, string userLanguage, out string videoDirectory)
        {
            bool hasDir = true;
            videoDirectory = videoServerPath;
            DirectoryInfo videoDirectoryInfo = new DirectoryInfo(videoServerPath);
            
            if (userLanguage != VideoDefaultLanguage && !videoDirectoryInfo.Exists)
            {
                // fallback video directory to English
                hasDir = false;
                videoDirectory = videoServerPath.Replace("/" + userLanguage, "/" + VideoDefaultLanguage);
            }

            return hasDir;
        }

        public static IList<VideoPlayList> GetAllVideoPlayList(string videoDirectory, string videoWebPath)
        {
            DirectoryInfo videoDirectoryInfo = new DirectoryInfo(videoDirectory);

            if (!videoDirectoryInfo.Exists)
                return new List<VideoPlayList>();

            FileInfo[] videoFiles = videoDirectoryInfo.GetFiles("*.mp4");
            
            return videoFiles.Select(videoFile => GetVideoPlayList(videoFile, videoWebPath)).ToArray();
        }

        public static VideoPlayList GetVideoPlayList(FileInfo videoFile, string videoWebPath)
        {
            VideoPlayList videoPlayList = new VideoPlayList();

            VideoSource videoSource = new VideoSource();
            VideoThumbnail videoThumbnail = new VideoThumbnail();

            videoPlayList.sources = new List<VideoSource>();
            videoPlayList.thumbnail = new List<VideoThumbnail>();

            string videoName = Path.GetFileNameWithoutExtension(videoFile.Name);
            string videoSourceFile = string.Format(@"{0}/{1}.mp4", videoWebPath, videoName).ToLowerInvariant();
            string videoThumbnailFile = string.Format(@"{0}/{1}.jpg", videoWebPath, GetVideoThumbnailName(videoName)).ToLowerInvariant();

            videoPlayList.name = videoName;
            videoSource.type = "video/mp4";
            videoSource.src = videoSourceFile;

            if (HasVideoThumbnail(videoFile))
                videoThumbnail.src = videoThumbnailFile;

            videoPlayList.sources.Add(videoSource);
            videoPlayList.thumbnail.Add(videoThumbnail);

            return videoPlayList;
        }

        public static bool HasVideoThumbnail(FileInfo videoFile)
        {
            string videoName = Path.GetFileNameWithoutExtension(videoFile.Name);
            string videoThumbnailDirectory = string.Format(@"{0}/{1}.jpg", videoFile.Directory, GetVideoThumbnailName(videoName));
            return File.Exists(videoThumbnailDirectory);
        }

        public static string GetVideoThumbnailName(string videoName)
        {
            return videoName.Replace(" ", string.Empty);
        }
    }
}
