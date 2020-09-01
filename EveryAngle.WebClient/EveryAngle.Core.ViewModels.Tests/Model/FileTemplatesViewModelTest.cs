using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class FileTemplatesViewModelTest : UnitTestBase
    {
        [TestCase]
        public void FileTemplatesViewModel_BasicFile()
        {
            //arrange
            FileTemplatesViewModel viewModel = new FileTemplatesViewModel
            {
                File = "file",
                Size = 1000L,
                Modified = 2000L,
                Uri = "uri",
                IsDefaultFile = true,
            };

            //assert type
            Assert.AreEqual(viewModel.File.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Size.GetType(), typeof(long));
            Assert.AreEqual(viewModel.Modified.GetType(), typeof(long));
            Assert.AreEqual(viewModel.Uri.GetType(), typeof(string));
            Assert.AreEqual(viewModel.IsDefaultFile.GetType(), typeof(bool));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("file"));
            Assert.IsTrue(viewModelSerialize.Contains("1000"));
            Assert.IsTrue(viewModelSerialize.Contains("2000"));
            Assert.IsTrue(viewModelSerialize.Contains("uri"));
            Assert.IsTrue(viewModelSerialize.Contains("\"ReInnoweraProcessList\":\"\""));
        }

        [TestCase]
        public void FileTemplatesViewModel_InnoweraFile()
        {
            //arrange
            FileTemplatesViewModel viewModel = new FileTemplatesViewModel
            {
                File = "file",
                HasInnoweraProcess = true,
                InnoweraProcessDetails = new List<InnoweraProcess>
                {
                    new InnoweraProcess
                    {
                        DisplayName = "display_name1",
                        SapProcessName = "sap_process_name1"
                    },
                    new InnoweraProcess
                    {
                        DisplayName = "display_name2",
                        SapProcessName = "sap_process_name2"
                    }
                }
            };

            //assert type
            Assert.AreEqual(viewModel.File.GetType(), typeof(string));
            Assert.AreEqual(viewModel.HasInnoweraProcess.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.InnoweraProcessDetails.GetType(), typeof(List<InnoweraProcess>));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("file"));
            Assert.IsTrue(viewModelSerialize.Contains("true"));
            Assert.IsTrue(viewModelSerialize.Contains("display_name1, display_name2"));
            Assert.IsTrue(viewModelSerialize.Contains("sap_process_name1, sap_process_name2"));
        }
    }
}