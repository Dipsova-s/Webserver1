using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class VersionViewModelTest : UnitTestBase
    {
        [TestCase]
        public void VersionViewModel_TEST()
        {
            //arrange
            VersionViewModel viewModel = new VersionViewModel
            {
                Version = "version",
                IsLatest = true,
                Entries = new List<Entry>()
            };

            //assert type
            Assert.AreEqual(viewModel.Version.GetType(), typeof(string));
            Assert.AreEqual(viewModel.IsLatest.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.Entries.GetType(), typeof(List<Entry>));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("version"));
            Assert.IsTrue(viewModelSerialize.Contains("is_latest"));
            Assert.IsTrue(viewModelSerialize.Contains("entries"));
        }
    }
}
