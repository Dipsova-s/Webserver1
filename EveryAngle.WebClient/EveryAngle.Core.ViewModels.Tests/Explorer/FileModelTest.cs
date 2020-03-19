using EveryAngle.Core.ViewModels.Explorer;
using Newtonsoft.Json;
using NUnit.Framework;
using System.Collections.Generic;
using System.IO;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class FileModelTest : UnitTestBase
    {
        [Test]
        public void FileModel_DynamicData_LogFile_TEST()
        {
            //arrange
            dynamic file = JsonConvert.DeserializeObject(JsonConvert.SerializeObject(new
            {
                size = 1024,
                file = "test.log",
                modified = 1512015745,
                uri = "/log",
                error_count = 1,
                warning_count = 5
            }));
            FileModel viewModel = new FileModel(file, "http://host:5555/logfiles");

            //assert
            Assert.AreEqual(viewModel.Category.Value, FileType.Log);
            Assert.AreEqual(viewModel.ErrorCount, 1);
            Assert.AreEqual(viewModel.WarningCount, 5);
            Assert.AreEqual(viewModel.Extension, ".log");
            Assert.AreEqual(viewModel.FullPath, "http://host:5555/logfiles/log");
            Assert.AreEqual(viewModel.Modified, 1512015745);
            Assert.AreEqual(viewModel.Name, "test.log");
            Assert.AreEqual(viewModel.Size, 1024);
            Assert.AreEqual(viewModel.SizeText, "1.0 KB");
            Assert.AreEqual(viewModel.SupportViewer, true);
        }

        [Test]
        public void FileModel_DynamicData_CslFile_TEST()
        {
            //arrange
            dynamic file = JsonConvert.DeserializeObject(JsonConvert.SerializeObject(new
            {
                size = 1024,
                file = "test.csl",
                modified = 1512015745,
                url = "/log"
            }));
            FileModel viewModel = new FileModel(file, string.Empty);

            //assert
            Assert.AreEqual(viewModel.Category.Value, FileType.Csl);
            Assert.AreEqual(viewModel.ErrorCount, 0);
            Assert.AreEqual(viewModel.WarningCount, 0);
            Assert.AreEqual(viewModel.Extension, ".csl");
            Assert.AreEqual(viewModel.FullPath, "/log");
            Assert.AreEqual(viewModel.Modified, 1512015745);
            Assert.AreEqual(viewModel.Name, "test.csl");
            Assert.AreEqual(viewModel.Size, 1024);
            Assert.AreEqual(viewModel.SizeText, "1.0 KB");
            Assert.AreEqual(viewModel.SupportViewer, true);
        }

        [TestCase("file1.txt", false)]
        [TestCase("file2.log", true)]
        [TestCase("file3.csl", true)]
        public void FileModel_FileInfoData_TEST(string filename, bool isSupportViewer)
        {
            //arrange
            FileInfo file = new FileInfo(TestResourcesPath + "LogTests\\" + filename);
            FileModel viewModel = new FileModel(file);

            //assert
            Assert.AreEqual(viewModel.ErrorCount, 0);
            Assert.AreEqual(viewModel.WarningCount, 0);
            Assert.AreEqual(viewModel.Name, filename);
            Assert.AreEqual(viewModel.SupportViewer, isSupportViewer);
        }

        [TestCase("", 0)]
        [TestCase("*.*", 3)]
        [TestCase("*.log", 1)]
        [TestCase("*.csl", 1)]
        [TestCase("*.log|*.csl", 2)]
        public void FileModel_GetFiles_TEST(string searchPattern, int expectedFileCount)
        {
            //arrange
            string logPath = TestResourcesPath + "LogTests\\";
            string[] searchPatterns = searchPattern.Split('|');
            List<FileModel> files = FileModel.GetFiles(logPath, searchPatterns);

            //assert
            Assert.AreEqual(files.Count, expectedFileCount);
        }
    }
}
