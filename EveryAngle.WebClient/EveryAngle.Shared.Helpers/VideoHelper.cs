using System.Collections.Generic;
using System.IO;

namespace EveryAngle.Shared.Helpers
{
    public static class VideoHelper
    {
        /// <summary>
        /// Get list of video which are not have a thumbnail
        /// </summary>
        /// <param name="videoPath">Video directory</param>
        /// <param name="searchAllDirectories">Is include sub directory or not?</param>
        /// <returns></returns>
        public static List<string> GetVideosNoThumbnailFromDirectory(string videoPath, bool searchAllDirectories = false)
        {
            List<string> videos = new List<string>();

            if (Directory.Exists(videoPath))
            {
                SearchOption searchOption = searchAllDirectories ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
                string[] files = Directory.GetFiles(videoPath, @"*.mp4", searchOption);
                int loop;
                int fileCount = files.Length;

                for (loop = 0; loop < fileCount; loop++)
                {
                    string imageFileName = GetImageFileFromVideoFile(files[loop]);
                    if (!File.Exists(imageFileName))
                    {
                        videos.Add(files[loop]);
                    }
                }
            }

            return videos;
        }

        /// <summary>
        /// Get image file from video file
        /// </summary>
        /// <param name="videoFile">Video file path</param>
        /// <returns></returns>
        public static string GetImageFileFromVideoFile(string videoFile)
        {
            FileInfo file = new FileInfo(videoFile);
            string imageFileName = string.Format(@"{0}/{1}.jpg", file.Directory.ToString().ToLower(), file.Name.Substring(0, file.Name.Length - 4).Replace(" ", ""));

            return imageFileName;
        }
    }
}
