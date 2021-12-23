using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using System.Net;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Web;
using System;
using System.Web.UI.WebControls;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class AngleWarningsFileService : IAngleWarningsFileService
    {
        public AngleWarningsFileViewModel Download() {
            string angleWarningFileFolder = ConfigurationManager.AppSettings.Get("AngleWarningFileFolder");
            string[] files = Directory.GetFiles(angleWarningFileFolder + "/");
            // remove the extension 
            var dotIndex = files[0].LastIndexOf('.');
            string folderPath = files[0].Remove(dotIndex, files[0].Length - dotIndex);
            string[] splitPath = folderPath.Split('/');
            string fileName = splitPath[splitPath.Length - 1];
            var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Tools\\Data", fileName + ".xlsx");

            HttpResponse response = HttpContext.Current.Response;
            response.BufferOutput = true;
            response.ContentType = "application/octet-stream; charset=UTF-8";
            response.AppendHeader("Content-Disposition", "attachment; filename=" + fileName + ".xlsx" + ";");
            response.ContentEncoding = Encoding.UTF8;
            response.HeaderEncoding = Encoding.UTF8;
            response.TransmitFile(path);
            return new AngleWarningsFileViewModel
            {
                FileName = fileName
            };
        }
    }
}
