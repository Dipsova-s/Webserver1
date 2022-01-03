using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Logging;
using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public class AngleWarningsFileManager : IAngleWarningsFileManager
    {
        private readonly IFileHelper _fileHelper;

        public AngleWarningsFileManager(IFileHelper fileHelper)
        {
            _fileHelper = fileHelper ?? throw new ArgumentNullException(nameof(fileHelper));
        }

        public FileInfo UploadAngleWarningsFile(HttpPostedFileBase file, out bool isInvalid)
        {
            var path = ConfigurationManager.AppSettings.Get("AngleWarningsContentInputFile");

            var tempFolder = GetAngleWarningPath(Path.Combine(Path.GetDirectoryName(path), "Temp"));
            var tempPath = Path.Combine(tempFolder, file.FileName);
            file.SaveAs(tempPath);

            isInvalid = true;
            FileInfo fileInfo = null;
            if (TryReadInputColumnHeaders(tempPath))
            {
                if (File.Exists(path))
                {
                    File.Delete(path);
                }
                file.SaveAs(Path.Combine(path));

                fileInfo = new FileInfo(path);
                isInvalid = false;                
            }

            Directory.Delete(tempFolder, true);
            return fileInfo;
        }        

        public FileViewModel DownloadAngleWarningsFile(string fullPath) 
        {
            string file = Base64Helper.Decode(fullPath);
            string fileName;
            byte[] fileBytes;

            FileInfo fileInfo = new FileInfo(file);

            VerifyArbitraryPathTraversal(fileInfo);

            fileBytes = File.ReadAllBytes(file);
            fileName = fileInfo.Name;

            return new FileViewModel
            {
                FileBytes = fileBytes,
                FileName = fileName
            };
        }

        public List<string> ReadContentInputExcelFileFromDisk()
        {
            string file = ConfigurationManager.AppSettings["AngleWarningsContentInputFile"];

            if (file is null)
            {
                throw new ArgumentNullException(file, "Setting AngleWarningsContentInputFile not found.");
            }

            if (!_fileHelper.FileExists(file))
            {
                throw new FileNotFoundException($"File {file} not found.");
            }

            List<string> result = new List<string>();

            DataTable data = _fileHelper.ReadExcel(file, "sheet1", 1);

            foreach (DataRow dataRow in data.Rows)
            {
                string[] fields = dataRow.ItemArray.Select(field => field.ToString()).ToArray();
                result.Add(string.Join(",", fields));
            }

            return result;
        }

        private bool TryReadInputColumnHeaders(string filePath)
        {
            bool succeeded = true;
            List<string> expected = new List<string> { "Type", "AWT Method", "Version", "Class", "Technical name Old / action", "Technical name New" };

            try
            {
                List<string> csvHeaderData = ReadContentExcelColumnHeaders(filePath);
                string[] inputLine = { };

                for (int i = 0; i < csvHeaderData.Count; i++)
                {
                    inputLine = csvHeaderData[i].Split(',');
                }

                for (int j = 0; j < inputLine.Length; j++)
                {
                    if (inputLine[j] != expected.ElementAt(j))
                    {
                        succeeded = false;
                    }
                }
            }
            catch (Exception ex)
            {
                Log.SendWarning("Angle warnings, reading input file column headers failed: {0}", ex.Message);
                succeeded = false;
            }

            return succeeded;
        }
        private List<string> ReadContentExcelColumnHeaders(string file)
        {
            if (file is null)
            {
                throw new ArgumentNullException(file, "Setting AngleWarningsContentInputFile not found.");
            }

            if (!_fileHelper.FileExists(file))
            {
                throw new FileNotFoundException($"File {file} not found.");
            }

            List<string> result = new List<string>();

            DataTable data = _fileHelper.ReadExcelColumnHeaders(file, "sheet1");

            foreach (DataRow dataRow in data.Rows)
            {
                string[] fields = dataRow.ItemArray.Select(field => field.ToString()).ToArray();
                result.Add(string.Join(",", fields));
            }

            return result;
        }

        private string GetAngleWarningPath(string angleWarningFileFolder)
        {
            string targetFolder;

            if (Path.IsPathRooted(angleWarningFileFolder))
            {
                targetFolder = angleWarningFileFolder;

                if (!Directory.Exists(Path.GetFullPath(angleWarningFileFolder)))
                {
                    Directory.CreateDirectory(Path.GetFullPath(angleWarningFileFolder));
                }
            }
            else
            {
                targetFolder = string.Format(@"~{0}", Path.GetDirectoryName(ConfigurationManager.AppSettings.Get("AngleWarningsContentInputFile")));
            }

            return targetFolder;
        }

        private void VerifyArbitraryPathTraversal(FileInfo fileInfo)
        {
            string angleWarningFileFolder = GetAngleWarningPath(Path.GetDirectoryName(ConfigurationManager.AppSettings.Get("AngleWarningsContentInputFile")));
            string fullPathLogFileFolder = Path.GetFullPath(angleWarningFileFolder);
            DirectoryInfo angleWarningDirectoryInfo = new DirectoryInfo(fullPathLogFileFolder);

            if (!fileInfo.FullName.StartsWith(angleWarningDirectoryInfo.FullName, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new HttpException((int)HttpStatusCode.Forbidden, JsonConvert.SerializeObject(new
                {
                    reason = HttpStatusCode.Forbidden.ToString(),
                    message = Resource.MC_AccessRequestedPathDenied
                }));
            }
        }
    }
}