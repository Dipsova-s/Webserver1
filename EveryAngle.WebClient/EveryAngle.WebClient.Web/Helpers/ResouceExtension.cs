using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Resources;
using System.Web.Mvc;

namespace EveryAngle.WebClient.Web.Helpers
{
    public static class ResouceExtension
    {
        public static string GetDomainImageFolderList()
        {
            IList<string> foldersName = new List<string>();
            string path = GetDomainPath();
            string[] picFolders = Directory.GetDirectories(path);
            foreach (var fpath in picFolders)
            {
                DirectoryInfo dInfo = new DirectoryInfo(fpath);
                foldersName.Add(dInfo.Name);                
            }
            return string.Join(",", foldersName.ToArray());
        }
        public static string GetDomainImageList()
        {
            IList<string> images = new List<string>();
            string path = GetDomainPath();
            string[] files = Directory.GetFiles(path, "*.png", SearchOption.AllDirectories);
            foreach (string file in files)
            {
                FileInfo info = new FileInfo(file);
                images.Add($"{info.Directory.Name}/{info.Name}");
            }
            return string.Join(",", images.ToArray());
        }

        private static string GetDomainPath()
        {
            string defualtDomainImageFolder = "Domains";
            string webconfigDomainImageFolder = WebConfigHelper.GetAppSettingByKey("DomainImageFolderName");
            string domainImagefolder = string.IsNullOrEmpty(webconfigDomainImageFolder) ? defualtDomainImageFolder : webconfigDomainImageFolder;
            return System.Web.HttpContext.Current.Server.MapPath(@"~/Images/" + domainImagefolder);
        }
    }
}
