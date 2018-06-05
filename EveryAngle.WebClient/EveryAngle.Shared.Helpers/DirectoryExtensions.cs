using System.Collections.Generic;
using System.IO;

namespace EveryAngle.Shared.Helpers
{
    public static class DirectoryExtensions
    {
        /// <summary>
        /// Get files in specific directory with multiple search patterns
        /// </summary>
        /// <param name="path"></param>
        /// <param name="searchPatterns"></param>
        /// <param name="searchOption"></param>
        /// <returns></returns>
        public static IList<string> EnumerateFiles(string path, string[] searchPatterns, SearchOption searchOption)
        {
            List<string> files = new List<string>();
            foreach (string searchPattern in searchPatterns)
                files.AddRange(Directory.EnumerateFiles(path, searchPattern, searchOption));
            return files;
        }
    }
}
