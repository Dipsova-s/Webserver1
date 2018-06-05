using System;
using System.Diagnostics;
using System.IO;
using System.Web;
using EveryAngle.Logging;

namespace EveryAngle.ManagementConsole.App_Start
{
    public static class CustomIConConfig
    {
        public static readonly string ExtraFileFolder =
            HttpContext.Current.Server.MapPath("~\\UploadedResources\\ExtraFiles");

        public static readonly string CustomIconFolder =
            HttpContext.Current.Server.MapPath("~\\UploadedResources\\FieldCategoryIcons");

        public static void InitialCustomImages()
        {

            if (Directory.Exists(ExtraFileFolder))
            {
                var imagesPath = Directory.GetFiles(ExtraFileFolder, "*.png");
                for (var index = 0; index < imagesPath.Length; index++)
                {
                    try
                    {
                        if (File.Exists(imagesPath[index]))
                        {
                            var fileInfo = new FileInfo(imagesPath[index]);
                            var targetFile = Path.Combine(CustomIconFolder, fileInfo.Name);
                            if (File.Exists(targetFile))
                            {
                                File.Delete(targetFile);
                            }
                            File.Copy(imagesPath[index], targetFile, true);
                            File.Delete(imagesPath[index]);
                        }
                    }
                    catch (Exception ex)
                    {
                        Log.SendInfo("CustomIConConfig cannot initial the images: " + ex.Message);
                    }
                }
            }
        }
    }
}
