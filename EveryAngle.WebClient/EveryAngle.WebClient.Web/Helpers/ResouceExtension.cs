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
        public  static string GetDomainImageFolderList()
        {
            string domainImageFolders = string.Empty;

            string defualtDomainImageFolder = "Domains";
            string webconfigDomainImageFolder = WebConfigHelper.GetAppSettingByKey("DomainImageFolderName");
            string domainImagefolder = string.IsNullOrEmpty(webconfigDomainImageFolder) ? defualtDomainImageFolder : webconfigDomainImageFolder;

            string path = System.Web.HttpContext.Current.Server.MapPath(@"~/Images/" + domainImagefolder);

            IList<string> foldersName = new List<string>();

            string[] picFolders = Directory.GetDirectories(path);

            foreach (var fpath in picFolders)
            {
                DirectoryInfo dInfo = new DirectoryInfo(fpath);
                foldersName.Add(dInfo.Name);                
            }

            domainImageFolders = String.Join(",", foldersName.ToArray());

            return domainImageFolders;
        }
    }
}
