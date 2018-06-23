using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Web.Http.Filters;

namespace EveryAngle.WebClient.Web.Helpers
{
    public class DeleteFileAttribute : ActionFilterAttribute
    {
        String generateFolder = Path.Combine(RuntimeEnvironment.GetRuntimeDirectory(), "Temporary ASP.NET Files");
        Int32 ClearOldFilesDay = Convert.ToInt32(System.Configuration.ConfigurationManager.AppSettings.Get("ClearGeneratedExcelFilesDay"));

        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            if (actionExecutedContext.Request.Method == HttpMethod.Get)
            {
                string fileFolder = System.Web.HttpContext.Current.Server.MapPath("~/Data/Export");
                this.DeleteOldFiles("xlsx");
                this.DeleteOldFiles("eapackage");
                //var oldFiles = Directory.GetFiles(generateFolder, "*.xlsx", SearchOption.TopDirectoryOnly).Select(f => new FileInfo(f)).Where(fi => fi.CreationTime <= DateTime.Now.AddDays(ClearOldFilesDay * -1));

                //foreach (var oldFile in oldFiles)
                //{
                //    File.SetAttributes(oldFile.FullName, FileAttributes.Normal);
                //    File.Delete(oldFile.FullName);
                //}
            }
        }

        private void DeleteOldFiles(string extension)
        {
            var filePath = generateFolder;
            this.DeleteOldFiles(extension, filePath);
        }
        private void DeleteOldFiles(string extension, string path)
        {
            var oldFiles = Directory.GetFiles(path, string.Format("*.{0}", extension), SearchOption.TopDirectoryOnly).Select(f => new FileInfo(f)).Where(fi => fi.CreationTime <= DateTime.Now.AddDays(ClearOldFilesDay * -1));

            foreach (var oldFile in oldFiles)
            {
                File.SetAttributes(oldFile.FullName, FileAttributes.Normal);
                File.Delete(oldFile.FullName);
            }
        }
    }
}
