using EveryAngle.Core.ViewModels.Explorer;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.WebClient.Service.ApiServices;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.ManagementConsole.Test.Services
{
    [TestFixture]
    public class STSLogServiceTest
    {
        private Mock<STSLogService> _service;

        [SetUp]
        public void SetUp()
        {
            _service = new Mock<STSLogService>();
        }

        [Test]
        public void Get_Should_ReturnData_When_Call()
        {
            _service
                .Setup(x => x.GetItems<ComponentLogViewModel>("sts/logfiles", "logfiles"))
                .Returns(new List<ComponentLogViewModel>
                {
                    new ComponentLogViewModel
                    {
                        file = "filename.log",
                        size = 512,
                        modified = DateTime.Today.Ticks,
                        uri = "/sts/filename.log"
                    }
                });

            IEnumerable<FileModel> result = _service.Object.Get();

            Assert.NotNull(result);
            Assert.AreEqual(result.Count(), 1);

            FileModel file = result.First();
            Assert.AreEqual(file.Size, 512);
            Assert.AreEqual(file.Name, "filename.log");
            Assert.AreEqual(file.Modified, DateTime.Today.Ticks);
            Assert.AreEqual(file.FullPath, "/sts/filename.log");
        }
    
}
}
