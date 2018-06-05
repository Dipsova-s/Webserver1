using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class FieldDomainViewModelTest : UnitTestBase
    {
        private static FieldDomainViewModel fieldDomainViewModel = new FieldDomainViewModel();
        private static ElementsViewModel elementsViewModel = new ElementsViewModel();

        #region Setup

        [SetUp]
        public override void Setup()
        {
            InitialFieldDomainViewModel();
            InitialElementsViewModel();
        }

        #endregion

        #region Tests

        [TestCase("id", typeof(string), "id")]
        [TestCase("short name", typeof(string), "short_name")]
        [TestCase("long name", typeof(string), "long_name")]
        [TestCase(10, typeof(int), "element_count")]
        [TestCase(null, null, "elements")]
        [TestCase(true, typeof(bool), "may_be_sorted")]
        public void FieldDomainViewModel_TEST(object value, Type expected, string expectedField)
        {
            if (value != null)
            {
                Type typeOfValue = value.GetType();
                //assert type
                Assert.AreEqual(typeOfValue, expected);
            }

            if (expectedField == "elements")
                Assert.AreEqual(fieldDomainViewModel.elements.GetType(), typeof(List<ElementsViewModel>));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(fieldDomainViewModel);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        [TestCase("id", typeof(string), "id")]
        [TestCase("short name", typeof(string), "short_name")]
        [TestCase("long name", typeof(string), "long_name")]
        [TestCase("pattern", typeof(string), "pattern")]
        [TestCase("color", typeof(string), "color")]
        public void ElementsViewModel_TEST(object value, Type expected, string expectedField)
        {
            if (value != null)
            {
                Type typeOfValue = value.GetType();
                //assert type
                Assert.AreEqual(typeOfValue, expected);
            }

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(elementsViewModel);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        #endregion

        #region Helper

        private static void InitialFieldDomainViewModel()
        {
            //arrange
            fieldDomainViewModel = new FieldDomainViewModel
            {
                id = "id",
                short_name = "short name",
                long_name = "long name",
                element_count = 10,
                elements = new List<ElementsViewModel>(),
                may_be_sorted = true
            };
        }

        private static void InitialElementsViewModel()
        {
            //arrange
            elementsViewModel = new ElementsViewModel
            {
                id = "id",
                short_name = "short name",
                long_name = "long name",
                pattern = "pattern",
                color = "color"
            };
        }

        #endregion
    }
}