using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using NUnit.Framework;
using System;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class ClassViewModelTest : UnitTestBase
    {
        private static ClassViewModel classViewModel = new ClassViewModel();
        
        #region Setup

        [SetUp]
        public override void Setup()
        {
            InitialClassViewModel();
        }

        #endregion

        #region Tests

        [TestCase("short_name", typeof(string), "short_name")]
        [TestCase("long_name", typeof(string), "long_name")]
        [TestCase("id", typeof(string), "id")]
        [TestCase("helpid", typeof(string), "helpid")]
        [TestCase("helptext", typeof(string), "helptext")]
        [TestCase(true, typeof(bool), "Allowed")]
        public void ClassViewModel_TEST(object value, Type expected, string expectedField)
        {
            Type typeOfValue = value.GetType();
            //assert type
            Assert.AreEqual(typeOfValue, expected);

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(classViewModel);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        #endregion

        #region Helper

        private static void InitialClassViewModel()
        {
            //arrange
            classViewModel = new ClassViewModel
            {
                short_name = "short_name",
                long_name = "long_name",
                id = "id",
                helpid = "helpid",
                helptext = "helptext",
                Allowed = true,
            };
        }

        #endregion
    }
}
