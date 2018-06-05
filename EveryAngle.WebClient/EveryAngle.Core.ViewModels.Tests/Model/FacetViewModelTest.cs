using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class FacetViewModelTest : UnitTestBase
    {
        private static FacetViewModel facetViewModel = new FacetViewModel();
        private static FacetFilterViewModel filters = new FacetFilterViewModel();

        #region Setup

        [SetUp]
        public override void Setup()
        {
            InitialClassViewModel(); 
            InitialFiltersViewModel();
        }

        #endregion

        #region Tests

        [TestCase("id", typeof(string), "id")]
        [TestCase("name", typeof(string), "name")]
        [TestCase("type", typeof(string), "type")]
        [TestCase(null, null, "filters")]
        public void FacetViewModel_TEST(object value, Type expected, string expectedField)
        {
            if (value != null)
            {
                Type typeOfValue = value.GetType();
                //assert type
                Assert.AreEqual(typeOfValue, expected);
            }

            if (expectedField == "filters")
                Assert.AreEqual(facetViewModel.filters.GetType(), typeof(List<FacetFilterViewModel>));
            
            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(facetViewModel);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        [TestCase(100, typeof(int), "count")]
        [TestCase("id", typeof(string), "id")]
        [TestCase("name", typeof(string), "name")]
        [TestCase("description", typeof(string), "description")]
        public void Filters_TEST(object value, Type expected, string expectedField)
        {
            if (value != null)
            {
                Type typeOfValue = value.GetType();
                //assert type
                Assert.AreEqual(typeOfValue, expected);
            }

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(filters);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        #endregion

        #region Helper

        private static void InitialClassViewModel()
        {
            //arrange
            facetViewModel = new FacetViewModel
            {
                id = "id",
                name = "name",
                type = "type",
                filters = new List<FacetFilterViewModel>()
            };
        }

        private static void InitialFiltersViewModel()
        {
            //arrange
            filters = new FacetFilterViewModel
            {
                id = "id",
                name = "name",
                count = 100,
                description = "description"
            };
        }

        #endregion
    }
}
