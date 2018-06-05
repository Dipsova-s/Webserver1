using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class FieldViewModelTest : UnitTestBase
    {
        private static FieldViewModel fieldViewModel = new FieldViewModel();
        private static Header header = new Header();
        private static Field field = new Field();
        private static Option option = new Option();
        private static UserSpecific userSpecific = new UserSpecific();

        #region Setup

        [SetUp]
        public override void Setup()
        {
            InitialFieldViewModel();
            InitialHeader();
            InitialField();
            InitialOption();
            InitialUserSpecific();
        }

        #endregion

        #region Tests

        [TestCase("fields")]
        [TestCase("facets")]
        [TestCase("sort_options")]
        [TestCase("header")]
        public void FacetViewModel_TEST(string expectedField)
        {
            if (expectedField == "filters")
                Assert.AreEqual(fieldViewModel.fields.GetType(), typeof(List<Field>));

            if (expectedField == "facets")
                Assert.AreEqual(fieldViewModel.facets.GetType(), typeof(List<FacetViewModel>));

            if (expectedField == "sort_options")
                Assert.AreEqual(fieldViewModel.sort_options.GetType(), typeof(List<Option>));

            if (expectedField == "header")
                Assert.AreEqual(fieldViewModel.header.GetType(), typeof(Header));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(fieldViewModel);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        [TestCase(100, typeof(int), "total")]
        [TestCase(100, typeof(int), "page")]
        [TestCase(50, typeof(int), "pagesize")]
        public void Header_TEST(object value, Type expected, string expectedField)
        {
            if (value != null)
            {
                Type typeOfValue = value.GetType();
                //assert type
                Assert.AreEqual(typeOfValue, expected);
            }

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(header);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        [TestCase("id_12345", typeof(string), "id")]
        [TestCase("short_name", typeof(string), "short_name")]
        [TestCase("long_name", typeof(string), "long_name")]
        [TestCase("fieldtype", typeof(string), "fieldtype")]
        [TestCase(null, null, "user_specific")]
        [TestCase(true, typeof(bool), "is_suggested")]
        [TestCase("help id", typeof(string), "helpid")]
        [TestCase("help text", typeof(string), "helptext")]
        [TestCase("technical info", typeof(string), "technical_info")]
        public void Field_TEST(object value, Type expected, string expectedField)
        {
            if (value != null)
            {
                Type typeOfValue = value.GetType();
                //assert type
                Assert.AreEqual(typeOfValue, expected);
            }

            if (expectedField == "user_specific")
                Assert.AreEqual(field.user_specific.GetType(), typeof(UserSpecific));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(field);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        [TestCase("id_12345", typeof(string), "id")]
        [TestCase("short_name", typeof(string), "name")]
        [TestCase(true, typeof(bool), "default")]
        public void Option_TEST(object value, Type expected, string expectedField)
        {
            if (value != null)
            {
                Type typeOfValue = value.GetType();
                //assert type
                Assert.AreEqual(typeOfValue, expected);
            }

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(option);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        [TestCase(true, typeof(bool), "is_starred")]
        public void UserSpecific_TEST(object value, Type expected, string expectedField)
        {
            if (value != null)
            {
                Type typeOfValue = value.GetType();
                //assert type
                Assert.AreEqual(typeOfValue, expected);
            }

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(userSpecific);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        #endregion

        #region Helper

        private static void InitialFieldViewModel()
        {
            //arrange
            fieldViewModel = new FieldViewModel
            {
                fields = new List<Field>(),
                facets = new List<FacetViewModel>(),
                sort_options = new List<Option>(),
                header = new Header()
            };
        }

        private static void InitialHeader()
        {
            //arrange
            header = new Header
            {
                total = 100,
                page = 100,
                pagesize = 50
            };
        }

        private static void InitialField()
        {
            //arrange
            field = new Field
            {
                id = "id_12345",
                short_name = "short_name",
                long_name = "long_name",
                fieldtype = "fieldtype",
                user_specific = new UserSpecific(),
                is_suggested = true,
                helpid = "help id",
                helptext = "help text",
                technical_info = "technical info"
            };
        }

        private static void InitialOption()
        {
            //arrange
            option = new Option
            {
                id = "id_12345",
                name = "short_name",
                Default = true,
            };
        }

        private static void InitialUserSpecific()
        {
            //arrange
            userSpecific = new UserSpecific
            {
                is_starred = true,
            };
        }

        #endregion
    }
}
