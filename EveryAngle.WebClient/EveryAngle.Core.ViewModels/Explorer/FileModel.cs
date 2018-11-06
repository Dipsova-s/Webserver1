using EveryAngle.Shared.Helpers;
using EveryAngle.Utilities;
using System.Collections.Generic;
using System.IO;

namespace EveryAngle.Core.ViewModels.Explorer
{
    public enum FileType
    {
        Folder,
        File,
        Csl,
        Zip,
        Exe,
        Music,
        Video,
        Xml,
        Picture,
        Dll,
        Config,
        FixedRoot,
        NetworkRoot,
        RemovableRoot,
        DiscRoot,
        SysRoot,
        Log
    }

    public class Category
    {
        public Category(FileType type)
        {
            Value = type;
        }

        public FileType Value { get; private set; }

    }

    public class FileModel
    {
        public string Extension => Path.GetExtension(Name).ToLowerInvariant();
        public string Name { get; set; }
        public long Modified { get; set; }
        public string FullPath { get; set; }
        public Category Category => GetCategory(Extension);
        public long Size { get; set; }
        public string SizeText => UtilitiesHelper.GetFileSizeInString(Size);
        public int WarningCount { get; set; }
        public int ErrorCount { get; set; }
        public bool SupportViewer => Category.Value == FileType.Csl;

        #region private variables

        private readonly Dictionary<string, FileType> fileCategories = new Dictionary<string, FileType>
        {
            { ".exe", FileType.Exe },
            { ".config", FileType.Config },
            { ".dll", FileType.Dll },
            { ".zip", FileType.Zip },
            { ".xml", FileType.Xml },
            { ".mp3", FileType.Music },
            { ".wmv", FileType.Video },
            { ".bmp", FileType.Picture },
            { ".jpg", FileType.Picture },
            { ".jpeg", FileType.Picture },
            { ".png", FileType.Picture },
            { ".gif", FileType.Picture },
            { ".cur", FileType.Picture },
            { ".jp2", FileType.Picture },
            { ".ami", FileType.Picture },
            { ".ico", FileType.Picture },
            { ".csl", FileType.Csl },
            { ".log", FileType.Log },
        };

        #endregion

        #region constructure

        /// <summary>
        /// Get file info, use for AS & MS
        /// </summary>
        /// <param name="fi"></param>
        /// <param name="basePath"></param>
        public FileModel(dynamic fi, string basePath)
        {
            Size = (long)fi.size;
            Name = (string)fi.file;
            Modified = (long)fi.modified;

            // MS need base path and use "url" property
            // AS use "uri" property
            FullPath = string.Format("{0}{1}", basePath, fi.uri ?? fi.url);

            WarningCount = fi.warning_count ?? 0;
            ErrorCount = fi.error_count ?? 0;
        }

        /// <summary>
        /// Get file info, use for WC & MC
        /// </summary>
        /// <param name="fi"></param>
        public FileModel(FileInfo fi)
        {
            Size = fi.Length;
            Name = fi.Name;
            Modified = fi.LastWriteTime.ToUniversalTime().ToUnixTime();
            FullPath = Encode(fi.FullName);
        }

        #endregion

        #region public method

        public static string Encode(string filepath)
        {
            return filepath.Replace("\\", "/");
        }

        public static string Decode(string filepath)
        {
            return filepath.Replace("/", "\\");
        }
        
        public static List<FileModel> GetFiles(string path, string[] searchPatterns)
        {
            List<FileModel> files = new List<FileModel>();

            // path should be defined and search patterns are required
            if (!string.IsNullOrEmpty(path) && searchPatterns.Length != 0)
            {
                // make a correct windows path
                string safePath = Decode(path);

                try
                {
                    // get log files in the specific path
                    IList<string> filePaths = DirectoryExtensions.EnumerateFiles(safePath, searchPatterns, SearchOption.TopDirectoryOnly);
                    foreach (string filePath in filePaths)
                    {
                        FileInfo file = new FileInfo(filePath);
                        files.Add(new FileModel(file));
                    }
                }
                catch
                {
                    //Do nothing
                }
            }

            return files;
        }

        #endregion

        #region private method

        private Category GetCategory(string extension)
        {
            if (!fileCategories.TryGetValue(extension, out FileType fileType))
            {
                fileType = FileType.File;
            }

            return new Category(fileType);
        }

        #endregion
    }
}
