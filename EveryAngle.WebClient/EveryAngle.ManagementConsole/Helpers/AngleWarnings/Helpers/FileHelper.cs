using OfficeOpenXml;
using System;
using System.Data;
using System.Diagnostics.CodeAnalysis;
using System.IO;

namespace EveryAngle.ManagementConsole.Helpers
{
    public class FileHelper : IFileHelper
    {
        [ExcludeFromCodeCoverage]
        public bool FileExists(string file)
        {
            return System.IO.File.Exists(file);
        }

        [ExcludeFromCodeCoverage]
        private ExcelPackage GetExcelPackage(FileInfo fileInfo)
        {
            if (!File.Exists(fileInfo.FullName))
                throw new Exception(string.Format("File {0} cannot be found!.", fileInfo.FullName));

            return new ExcelPackage(fileInfo);
        }

        [ExcludeFromCodeCoverage]
        private ExcelPackage GetExcelPackage(string filePath)
        {
            FileInfo file = new FileInfo(filePath);

            return GetExcelPackage(file);
        }

        [ExcludeFromCodeCoverage]
        public DataTable ReadExcelColumnHeaders(string filePath, string sheetName)
        {
            DataTable dataTable = new DataTable();

            try
            {
                using (ExcelPackage excel = GetExcelPackage(filePath))
                {
                    //Get first work sheet from excel file
                    var workSheet = excel.Workbook.Worksheets[sheetName];

                    int columnIndex = 0;

                    // Prepare column for datatable.
                    foreach (var firstRowCell in workSheet.Cells[1, 1, 1, 6])
                    {
                        dataTable.Columns.Add(string.Format("Column{0}", columnIndex++));
                    }

                    for (int rowNum = 1; rowNum <= 1; rowNum++)
                    {
                        string firstRowCell = string.Format("A{0}", rowNum);

                        if (workSheet.Cells[firstRowCell].Value == null)
                            break;

                        var wsRow = workSheet.Cells[rowNum, 1, rowNum, 6];

                        DataRow row = dataTable.Rows.Add();

                        foreach (var cell in wsRow)
                        {
                            row[cell.Start.Column - 1] = cell.Value;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(string.Format("Error occured during conversion of excel to a datatable: {0}", ex.Message));
            }

            return dataTable;
        }

        [ExcludeFromCodeCoverage]
        public DataTable ReadExcel(string filePath, string sheetName, int headerRow)
        {
            DataTable dataTable = new DataTable();

            try
            {
                using (ExcelPackage excel = GetExcelPackage(filePath))
                {
                    //Get first work sheet from excel file
                    var workSheet = excel.Workbook.Worksheets[sheetName];

                    int columnIndex = 0;

                    // Prepare column for datatable.
                    foreach (var firstRowCell in workSheet.Cells[headerRow, 1, headerRow, 6])
                    {
                        dataTable.Columns.Add(string.Format("Column{0}", columnIndex++));
                    }

                    // Set first row of data in excel file.
                    int startDataRow = headerRow + 1;

                    for (int rowNum = startDataRow; rowNum <= workSheet.Dimension.End.Row; rowNum++)
                    {
                        string fistRowCell = string.Format("A{0}", rowNum);

                        if (workSheet.Cells[fistRowCell].Value == null)
                            break;

                        var wsRow = workSheet.Cells[rowNum, 1, rowNum, 6];

                        DataRow row = dataTable.Rows.Add();

                        foreach (var cell in wsRow)
                        {
                            row[cell.Start.Column - 1] = cell.Value;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception(string.Format("Error occured during conversion of excel to a datatable: {0}", ex.Message));
            }

            return dataTable;
        }
    }
}