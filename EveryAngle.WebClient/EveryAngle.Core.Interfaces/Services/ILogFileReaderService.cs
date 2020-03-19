﻿using EveryAngle.Core.ViewModels.SystemLog;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface ILogFileReaderService
    {
        FileReaderResult GetLogFileDetails(string path);
        void CopyForLogFile(string fullName, string fullPath);

    }
}
