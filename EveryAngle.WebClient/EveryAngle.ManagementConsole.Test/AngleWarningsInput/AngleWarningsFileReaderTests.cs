using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Text;

namespace EveryAngle.ManagementConsole.Test.AngleWarningsInput
{
    public class AngleWarningsFileReaderTests: UnitTestBase
    {
        [TestCase]
        public void AWT_ReadInputList_ShouldSucceed()
        {
            Mock<IFileHelper> fileHelper = new Mock<IFileHelper>();

            string csvData = "FieldA,FieldB,FieldC";
            Stream stream = new MemoryStream(Encoding.UTF8.GetBytes(csvData ?? ""));
            StreamReader streamReader = new StreamReader(stream);

            fileHelper.Setup(x => x.FileExists(It.IsAny<string>())).Returns(true);

            DataTable dataTable = new DataTable();
            dataTable.Columns.Add("Column1");
            dataTable.Columns.Add("Column2");
            dataTable.Columns.Add("Column3");

            DataRow dataRow = dataTable.NewRow();
            dataRow["Column1"] = "FieldA";
            dataRow["Column2"] = "FieldB";
            dataRow["Column3"] = "FieldC";
            dataTable.Rows.Add(dataRow);

            fileHelper.Setup(x => x.ReadExcel(It.IsAny<string>(), It.IsAny<string>(), 1)).Returns(dataTable);

            IAngleWarningsFileReader angleWarningsFileReader = new AngleWarningsFileReader(fileHelper.Object);
            List<string> contentInput = angleWarningsFileReader.ReadContentInputExcelFileFromDisk();

            Assert.AreEqual(csvData, contentInput[0]);
        }
        

        [TestCase]
        public void AWT_ReadInputList_FileDoesNotExists_ShouldGiveException()
        {
            Mock<IFileHelper> fileHelper = new Mock<IFileHelper>();
            fileHelper.Setup(x => x.FileExists(It.IsAny<string>())).Returns(false);
            IAngleWarningsFileReader angleWarningsFileReader = new AngleWarningsFileReader(fileHelper.Object);

            Assert.That(() => angleWarningsFileReader.ReadContentInputExcelFileFromDisk(), Throws.TypeOf<FileNotFoundException>());
        }

        [TestCase]
        public void AWT_ReadInputList_NoFileGiven_ShouldGiveException()
        {
            Mock<IFileHelper> fileHelper = new Mock<IFileHelper>();
            IAngleWarningsFileReader angleWarningsFileReader = new AngleWarningsFileReader(fileHelper.Object);

            ConfigurationManager.AppSettings.Set("AngleWarningsContentInputFile", null);

            Assert.That(() => angleWarningsFileReader.ReadContentInputExcelFileFromDisk(), Throws.TypeOf<ArgumentNullException>());

            ConfigurationManager.AppSettings.Set("AngleWarningsContentInputFile", @"c:\temp\inputfile.xlsx");
        }
    }
}
