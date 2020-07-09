using EveryAngle.Core.Interfaces.Services;
using System;
using System.IO;
using EveryAngle.Core.ViewModels.SystemLog;
using EveryAngle.WebClient.Service.ApiServices;
using EveryAngle.Core.ViewModels.Model;
using System.Text;

namespace EveryAngle.WebClient.Service.ApplicationServices
{
    public class LogFileReaderService : BaseService, ILogFileReaderService
    {
        public void CopyForLogFile(string fullName, string fullPath)
        {
            File.Copy(fullName, fullPath, true);
        }

        public FileReaderResult Get(string requestUrl)
        {
            var result = new FileReaderResult();
            try
            {
                FileViewModel viewModel = Download(requestUrl);
                result.Success = true;
                using(StreamReader streamReader = new StreamReader(new MemoryStream(viewModel.FileBytes)))
                {
                    result.StringContent = streamReader.ReadToEnd();
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
            }
            return result;
        }

        public FileReaderResult GetLogFileDetails(string path)
        {
            var result = new FileReaderResult();
            FileInfo resultFile = new FileInfo(path);
            if (IsFileExists(resultFile))
            {
                result.Success = true;
                try
                {
                    var resultText = ReadAllText(resultFile.FullName);
                    result.StringContent = resultText;
                }
                catch (Exception ex)
                {
                    result.Success = false;
                    result.ErrorMessage = ex.Message;
                }
            }
            return result;
        }
        public virtual bool IsFileExists(FileInfo fileInfo)
        {
            return fileInfo.Exists;
        }

        public virtual string ReadAllText(string fullName)
        {
            return File.ReadAllText(fullName);
        }
    }
}
