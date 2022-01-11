using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using EveryAngle.Shared.Helpers;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Text;
using System.Web;

namespace EveryAngle.ManagementConsole.Test.AngleWarningsInput
{
    public class AngleWarningsFileManagerTests: UnitTestBase
    {
        [Test]
        public void UploadAngleWarningsFile_ShouldSucceed()
        {
            var file = new Mock<HttpPostedFileBase>();
            file.Setup(x => x.FileName).Returns("TestFile.xlsx");
            file.Setup(x => x.ContentLength).Returns(10);
            file.Setup(x => x.InputStream).Returns(Stream.Null);
            bool isInvalid = true;
            Mock<IFileHelper> fileHelper = new Mock<IFileHelper>();
            IAngleWarningsFileManager fileManager = new AngleWarningsFileManager(fileHelper.Object);
            var result = fileManager.UploadAngleWarningsFile(file.Object, out isInvalid);
            Assert.IsNull(result);
        }

        [Test]
        public void DownloadAngleWarningsFile_ShouldSucceed()
        {
            var filePath = string.Format("{0}TestResources\\{1}.xlsx", AppDomain.CurrentDomain.BaseDirectory, "test");
            ConfigurationManager.AppSettings.Set("AngleWarningsContentInputFile", filePath);
            
            Mock<IFileHelper> fileHelper = new Mock<IFileHelper>();
            IAngleWarningsFileManager fileManager = new AngleWarningsFileManager(fileHelper.Object);
            var result = fileManager.DownloadAngleWarningsFile(Base64Helper.Encode(filePath));
            Assert.IsNotNull(result);
        }

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

            IAngleWarningsFileManager angleWarningsFileManager = new AngleWarningsFileManager(fileHelper.Object);
            List<string> contentInput = angleWarningsFileManager.ReadContentInputExcelFileFromDisk();

            Assert.AreEqual(csvData, contentInput[0]);
        }
        

        [TestCase]
        public void AWT_ReadInputList_FileDoesNotExists_ShouldGiveException()
        {
            Mock<IFileHelper> fileHelper = new Mock<IFileHelper>();
            fileHelper.Setup(x => x.FileExists(It.IsAny<string>())).Returns(false);
            IAngleWarningsFileManager angleWarningsFileManager = new AngleWarningsFileManager(fileHelper.Object);

            Assert.That(() => angleWarningsFileManager.ReadContentInputExcelFileFromDisk(), Throws.TypeOf<FileNotFoundException>());
        }

        [TestCase]
        public void AWT_ReadInputList_NoFileGiven_ShouldGiveException()
        {
            Mock<IFileHelper> fileHelper = new Mock<IFileHelper>();
            IAngleWarningsFileManager angleWarningsFileManager = new AngleWarningsFileManager(fileHelper.Object);

            ConfigurationManager.AppSettings.Set("AngleWarningsContentInputFile", null);

            Assert.That(() => angleWarningsFileManager.ReadContentInputExcelFileFromDisk(), Throws.TypeOf<ArgumentNullException>());

            ConfigurationManager.AppSettings.Set("AngleWarningsContentInputFile", @"c:\temp\inputfile.xlsx");
        }
    }
}
