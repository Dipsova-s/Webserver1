using EveryAngle.ManagementConsole.Helpers;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class EventLogHelperTests : UnitTestBase
    {
        #region private variables

        private readonly string _mockJSONString = "{\"string\":\"text\",\"number\":1,\"boolean\":true,\"array\":[\"array1\", \"array2\", \"array3\"],\"object\":{ \"object1\": \"object1\" },\"arrayobject\":[{ \"arrayobject1\": \"arrayobject1\" }]}";
        private List<TreeViewItemModel> _treeViewItemModelList = null;
        private IList<TreeViewItemModel> _testingViewModel = new List<TreeViewItemModel>();

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            InitiateTestingViewModel();
            base.Setup();
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_GetTreeViewItemModelList_By_String()
        {
            _testingViewModel = EventLogHelper.GetTreeViewItemModelList("");
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Can_GetTreeViewItemModelList_By_JToken(bool getByJToken)
        {
            JToken nullToken = null;
            IList<TreeViewItemModel> returnValue_Null = getByJToken ?
                                                        EventLogHelper.GetTreeViewItemModelList(nullToken) :
                                                        EventLogHelper.GetTreeViewItemModelList(string.Empty);

            JToken returnValue_ObjectPlainToken = JToken.FromObject(_testingViewModel[1]);
            IList<TreeViewItemModel> returnValue_ObjectPlain = getByJToken ? 
                                                               EventLogHelper.GetTreeViewItemModelList(returnValue_ObjectPlainToken) :
                                                               EventLogHelper.GetTreeViewItemModelList(returnValue_ObjectPlainToken.ToString(Formatting.None));

            IList<TreeViewItemModel> returnValue_Array = EventLogHelper.GetTreeViewItemModelList(JToken.FromObject(_testingViewModel));
            IList<TreeViewItemModel> returnValue_ObjectArray = EventLogHelper.GetTreeViewItemModelList(JToken.FromObject(_testingViewModel[0]));
            IList<TreeViewItemModel> returnValue_String = EventLogHelper.GetTreeViewItemModelList(JToken.FromObject(_testingViewModel[1].Id));

            // null object
            if (getByJToken)
                Assert.IsNull(returnValue_Null);
            else
                Assert.IsEmpty(returnValue_Null);

            // object with no array as childs
            Assert.IsNotEmpty(returnValue_ObjectPlain);
            Assert.AreEqual(15, returnValue_ObjectArray.Count);

            // array object
            Assert.IsNotEmpty(returnValue_Array);
            Assert.AreEqual(30, returnValue_Array.Count);

            // plain object with childs
            Assert.IsNotEmpty(returnValue_ObjectArray);
            Assert.AreEqual(15, returnValue_ObjectArray.Count);

            // string type
            Assert.IsNotEmpty(returnValue_String);
            Assert.AreEqual(1, returnValue_String.Count);
            Assert.AreEqual(_testingViewModel[1].Id, returnValue_String[0].Text);
        }

        [TestCase(0, "string: text")]
        [TestCase(1, "number: 1")]
        [TestCase(2, "boolean: True")]
        public void TestGetTreeViewItemModelListByString(int index, string expect)
        {
            // assert
            Assert.AreEqual(expect, _treeViewItemModelList[index].Text);
        }

        [Test]
        public void TestGetTreeViewItemModelListByArray()
        {
            // assert
            Assert.AreEqual(3, _treeViewItemModelList[3].Items.Count);
            Assert.AreEqual("array1", _treeViewItemModelList[3].Items[0].Text);
            Assert.AreEqual("array2", _treeViewItemModelList[3].Items[1].Text);
            Assert.AreEqual("array3", _treeViewItemModelList[3].Items[2].Text);
        }

        [Test]
        public void TestGetTreeViewItemModelListByObject()
        {
            // assert
            Assert.AreEqual(1, _treeViewItemModelList[4].Items.Count);
            Assert.AreEqual("object1: object1", _treeViewItemModelList[4].Items[0].Text);
        }

        [Test]
        public void TestGetTreeViewItemModelListByArrayObject()
        {
            // assert
            Assert.AreEqual(1, _treeViewItemModelList[5].Items.Count);
            Assert.AreEqual("arrayobject1: arrayobject1", _treeViewItemModelList[5].Items[0].Text);
        }

        #endregion

        #region private functions

        protected override void InitiateTestingViewModel()
        {
            _testingViewModel = new List<TreeViewItemModel>
            {
                new TreeViewItemModel
                {
                    Id = "parent_1",
                    Checked = true,
                    Encoded = false,
                    HasChildren = true,
                    Text = "parent_1",
                    Items = new List<TreeViewItemModel>
                    {
                        new TreeViewItemModel
                        {
                            Id = "childs_1"
                        }
                    }
                },
                new TreeViewItemModel
                {
                    Id = "parent_2",
                    Checked = false,
                    Encoded = true,
                    HasChildren = false,
                    Text = "parent_2"
                }
            };

            _treeViewItemModelList = EventLogHelper.GetTreeViewItemModelList(_mockJSONString);
        }

        #endregion
    }
}
