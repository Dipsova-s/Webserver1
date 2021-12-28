using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public class AngleWarningsFileReader : IAngleWarningsFileReader
    {
        private readonly IFileHelper _fileHelper;

        public AngleWarningsFileReader(IFileHelper fileHelper)
        {
            _fileHelper = fileHelper ?? throw new ArgumentNullException(nameof(fileHelper));
        }

        public List<string> ReadContentExcelColumnHeaders(string file)
        {
            if (file is null)
            {
                throw new ArgumentNullException("Setting AngleWarningsContentInputFile not found.", nameof(file));
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
        public List<string> ReadContentInputExcelFileFromDisk()
        {
            string file = ConfigurationManager.AppSettings["AngleWarningsContentInputFile"];

            if (file is null)
            {
                throw new ArgumentNullException("Setting AngleWarningsContentInputFile not found.", nameof(file));
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
    }
}