using EveryAngle.OData.BusinessLogic.Rows;
using EveryAngle.OData.DTO;
using EveryAngle.OData.EAContext;
using EveryAngle.OData.Proxy;
using EveryAngle.OData.Repository;
using Microsoft.Data.Edm;
using Microsoft.Data.Edm.Library;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Net.Http;
using System.Web.Http.OData;
using System.Web.Http.OData.Extensions;
using System.Web.Http.OData.Routing;

namespace EveryAngle.OData.Tests.BusinessLogicTests
{
    [TestFixture(Category = "ModelMetaData")]
    public class RowsEdmBusinessLogicTests : UnitTestBase
    {
        #region private variables

        private RowsEdmBusinessLogic _testingBusinessLogic;
        private NameValueCollection _nameValueCollection = new NameValueCollection();

        private DataRows _testingDataRows;
        private QueryResult _testingQueryResult;
        private Session _testingSession = new Session { security_token = "session_abc" };

        private Mock<IEdmCollectionType> _collectionType = new Mock<IEdmCollectionType>();
        private Mock<IContext> _context = new Mock<IContext>();
        private Mock<Display> _testingDisplay = new Mock<Display>();
        private Mock<IAppServerProxy> _appServerProxy = new Mock<IAppServerProxy>();
        private Mock<HttpRequestMessage> _requestMessage = new Mock<HttpRequestMessage>();

        private IEnumerable<TestCaseData> TestingFieldMaps
        {
            get
            {
                yield return new TestCaseData(new Dictionary<string, object> { { "a", 1.02 } }, new FieldMap { IsDecimal = true }, typeof(decimal));
                yield return new TestCaseData(null, new FieldMap { IsDecimal = true }, typeof(Nullable));
                yield return new TestCaseData("string", new FieldMap { NeedsConversion = false }, typeof(string));
                yield return new TestCaseData("enumerate", new FieldMap { IsEnumerated = true, NeedsConversion = true }, typeof(string));
                yield return new TestCaseData(33221100000000, new FieldMap { IsDouble = true, NeedsConversion = true }, typeof(double));
                yield return new TestCaseData(55667788991010, new FieldMap { IsPeriod = true, NeedsConversion = true }, typeof(long));
                yield return new TestCaseData(1230000000.0456, new FieldMap { IsDecimal = true, NeedsConversion = true }, typeof(decimal));
                yield return new TestCaseData(0.002, new FieldMap { IsDate = true, NeedsConversion = true }, typeof(DateTime));
                yield return new TestCaseData(980812800, new FieldMap { IsDate = true, NeedsConversion = true }, typeof(DateTime));
                yield return new TestCaseData(0.001, new FieldMap { IsTime = true, NeedsConversion = true }, typeof(TimeSpan));
                yield return new TestCaseData(81200, new FieldMap { IsTime = true, NeedsConversion = true }, typeof(TimeSpan));
            }
        }

        #endregion

        #region constructors

        public RowsEdmBusinessLogicTests()
        {

        }

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            Initialize();

            string mockInstance = "/models/1/instances/8";

            // query result default value
            _testingQueryResult = new QueryResult
            {
                uri = "results/1",
                successfully_completed = true
            };

            // datarows default value
            _testingDataRows = new DataRows
            {
                rows = new List<Row>
                {
                    new Row
                    {
                        field_values = new List<object>
                        {
                            10
                        }
                    }
                },
                fields = new List<string> { "field_id" },
                header = new Header { total = 1 }
            };

            // setup
            // collection
            Mock<IEdmTypeReference> elementType = new Mock<IEdmTypeReference>();
            Mock<IEdmEntityType> entityType = new Mock<IEdmEntityType>();

            entityType.SetupGet(x => x.TypeKind).Returns(EdmTypeKind.Primitive);
            elementType.SetupGet(x => x.Definition).Returns(entityType.Object);
            _collectionType.SetupGet(x => x.ElementType).Returns(elementType.Object);

            // request message 
            _requestMessage.Object.RequestUri = new Uri("http://localhost/odata/models/1/angles/2/displays/3", UriKind.Absolute);

            // path
            KeyValuePathSegment segment = new KeyValuePathSegment("/path");
            ODataPath odataPath = new ODataPath(segment);

            User testUser = new User("username", "password");
            testUser.RegisterSecurityToken("old_token");

            // context
            _context.SetupGet(x => x.User).Returns(testUser);

            // login and instance
            _appServerProxy.Setup(x => x.TryGetCurrentInstance(It.IsAny<User>(), out mockInstance)).Returns(true);
            _appServerProxy.Setup(x => x.LoginUser(It.IsAny<User>())).Returns(true);

            // result
            InitMockAppServerProxy(_testingQueryResult, _testingDataRows);
            _testingBusinessLogic = InitMockRowsBusinessLogic().Object;

            _nameValueCollection.Add("result", "1");
        }

        [TearDown]
        public void TearDown()
        {
            // re-init to clear all mock data
            Initialize();
        }

        #endregion

        #region private functions

        private void InitMockAppServerProxy(QueryResult queryResult, DataRows dataRows)
        {
            _appServerProxy.Setup(x => x.ExecuteAngleDisplay(_context.Object.User, _testingDisplay.Object)).Returns(queryResult);
            _appServerProxy.Setup(x => x.GetResult(_context.Object.User, It.IsAny<string>())).Returns(queryResult);
            _appServerProxy.Setup(x => x.GetResultData(_context.Object.User, It.IsAny<QueryResult>(), It.IsAny<Display>(), It.IsAny<int>(), It.IsAny<int?>())).Returns(dataRows);
        }

        private Mock<RowsEdmBusinessLogic> InitMockRowsBusinessLogic()
        {
            Mock<RowsEdmBusinessLogic> mockBusinessLogic = new Mock<RowsEdmBusinessLogic>(_appServerProxy.Object);

            mockBusinessLogic.Setup(x => x.GetEdmCollectionType(It.IsAny<HttpRequestMessageProperties>())).Returns(_collectionType.Object);

            mockBusinessLogic.Setup(x => x.GetEdmCollectionTypeReference(It.IsAny<IEdmCollectionType>(), It.IsAny<bool>()))
                .Returns(new Mock<EdmCollectionTypeReference>(new Mock<IEdmCollectionType>().Object, true).Object);

            mockBusinessLogic.Setup(x => x.GetEdmEntityObjectCollection(It.IsAny<IEdmCollectionTypeReference>(), It.IsAny<IList<IEdmEntityObject>>()))
                .Returns(new Mock<IEdmObject>().Object as EdmEntityObjectCollection);

            Mock<IEdmTypeReference> elementType = new Mock<IEdmTypeReference>();
            Mock<IEdmEntityType> entityType = new Mock<IEdmEntityType>();
            Mock<IEdmStructuralProperty> structuralProp = new Mock<IEdmStructuralProperty>();

            entityType.SetupGet(x => x.TypeKind).Returns(EdmTypeKind.None);
            elementType.SetupGet(x => x.Definition).Returns(entityType.Object);
            structuralProp.SetupGet(x => x.Type).Returns(elementType.Object);
            mockBusinessLogic.Setup(x => x.GetEdmStructuralProperty(It.IsAny<IEdmEntityType>())).Returns(new List<IEdmStructuralProperty> { structuralProp.Object });

            // other than mock function, use base implements
            mockBusinessLogic.CallBase = true;

            return mockBusinessLogic;
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_GetRowsEntityCollection()
        {
            EdmEntityObjectCollection collection = _testingBusinessLogic.GetRowsEntityCollection(
                                                   _context.Object, _requestMessage.Object, _nameValueCollection, _testingDisplay.Object);


            // expected null, expected that Odata handle by itself
            Assert.IsNull(collection);
        }

        [TestCase]
        public void Can_ReturnResult_If_Result_IsNot_Successful()
        {
            _testingQueryResult.successfully_completed = false;

            // init new mock value
            InitMockAppServerProxy(_testingQueryResult, _testingDataRows);
            _testingBusinessLogic = InitMockRowsBusinessLogic().Object;

            EdmEntityObjectCollection collection = _testingBusinessLogic.GetRowsEntityCollection(
                                                   _context.Object, _requestMessage.Object, _nameValueCollection, _testingDisplay.Object);


            // expected null, expected that Odata handle by itself
            Assert.IsNull(collection);
        }

        [TestCase]
        public void Can_ReturnResult_If_Result_IsNull()
        {
            _testingQueryResult = null;

            // init new mock value
            InitMockAppServerProxy(_testingQueryResult, _testingDataRows);
            _testingBusinessLogic = InitMockRowsBusinessLogic().Object;

            EdmEntityObjectCollection collection = _testingBusinessLogic.GetRowsEntityCollection(
                                                   _context.Object, _requestMessage.Object, _nameValueCollection, _testingDisplay.Object);


            // expected null, expected that Odata handle by itself
            Assert.IsNull(collection);
        }

        [TestCase]
        public void Can_ReturnResult_If_DataRows_IsNull()
        {
            _testingDataRows = null;

            // init new mock value
            InitMockAppServerProxy(_testingQueryResult, _testingDataRows);
            _testingBusinessLogic = InitMockRowsBusinessLogic().Object;

            EdmEntityObjectCollection collection = _testingBusinessLogic.GetRowsEntityCollection(
                                                   _context.Object, _requestMessage.Object, _nameValueCollection, _testingDisplay.Object);


            // expected null, expected that Odata handle by itself
            Assert.IsNull(collection);
        }

        [TestCase]
        public void Can_ReturnResult_If_DataRows_Rows_IsNull()
        {
            _testingDataRows.rows = null;

            // init new mock value
            InitMockAppServerProxy(_testingQueryResult, _testingDataRows);
            _testingBusinessLogic = InitMockRowsBusinessLogic().Object;

            EdmEntityObjectCollection collection = _testingBusinessLogic.GetRowsEntityCollection(
                                                   _context.Object, _requestMessage.Object, _nameValueCollection, _testingDisplay.Object);


            // expected null, expected that Odata handle by itself
            Assert.IsNull(collection);
        }

        [TestCase]
        public void Can_ReturnResult_When_DataRows_Rows_Has_NextLink()
        {
            _testingDataRows.header.total = 2;

            // init new mock value
            InitMockAppServerProxy(_testingQueryResult, _testingDataRows);
            _testingBusinessLogic = InitMockRowsBusinessLogic().Object;

            EdmEntityObjectCollection collection = _testingBusinessLogic.GetRowsEntityCollection(
                                                   _context.Object, _requestMessage.Object, _nameValueCollection, _testingDisplay.Object);


            // expected null, expected that Odata handle by itself
            Assert.IsNull(collection);
        }

        [TestCaseSource("TestingFieldMaps")]
        [TestCase(null, null, null)]
        public void Can_ConvertValue(object value, FieldMap fieldMap, Type expectType)
        {
            if (value == null && fieldMap == null && expectType == null)
                return;

            object convertedValue = _testingBusinessLogic.ConvertValue(value, fieldMap);

            if (value != null)
                Assert.AreEqual(expectType, convertedValue.GetType());
        }

        [TestCase]
        public void CanNot_ConvertValue()
        {
            Assert.Throws(typeof(OverflowException), TestThrowConvertValue);
        }

        [TestCase]
        public void Can_GetEdmCollectionType()
        {
            HttpRequestMessage reqMessage = new HttpRequestMessage();
            HttpRequestMessageProperties properties = reqMessage.ODataProperties();

            KeyValuePathSegment segment = new KeyValuePathSegment("/path");
            ODataPath odataPath = new ODataPath(segment);
            properties.Path = odataPath;

            RowsEdmBusinessLogic testingBusinessLogic = new RowsEdmBusinessLogic(_appServerProxy.Object);
            IEdmCollectionType edmType = testingBusinessLogic.GetEdmCollectionType(properties);

            Assert.IsNull(edmType);
        }

        [TestCase]
        public void Can_GetEdmCollectionTypeReference()
        {
            RowsEdmBusinessLogic testingBusinessLogic = new RowsEdmBusinessLogic(_appServerProxy.Object);
            IEdmCollectionTypeReference reference = testingBusinessLogic.GetEdmCollectionTypeReference(new Mock<IEdmCollectionType>().Object, true);

            Assert.IsNotNull(reference);
        }

        [TestCase]
        public void CanNot_GetEdmEntityObjectCollection()
        {
            // could be OData v 1-3 bug here.
            Assert.Throws(typeof(ArgumentNullException), TestThrowGetEdmEntityObjectCollection);
        }

        [TestCase]
        public void Can_GetEdmEntityObjectCollection()
        {
            EdmEntityType entityType = new EdmEntityType("EA", "entityType");
            entityType.AddStructuralProperty("EA_ID", EdmPrimitiveTypeKind.String);
            EdmModelContainer.Metadata[ModelType.Master].EdmModel.AddElement(entityType);

            IEdmSchemaType schemaType = EdmModelContainer.Metadata[ModelType.Master].EdmModel.FindDeclaredType("EA.entityType");
            IEdmEntityType eaEntityType = schemaType as IEdmEntityType;
            IEdmEntityTypeReference typeReference = new EdmEntityTypeReference(eaEntityType, true);

            RowsEdmBusinessLogic testingBusinessLogic = new RowsEdmBusinessLogic(_appServerProxy.Object);
            IEdmCollectionTypeReference collectionRef = testingBusinessLogic.GetEdmCollectionTypeReference(new EdmCollectionType(typeReference), true);
            EdmEntityObjectCollection products = testingBusinessLogic.GetEdmEntityObjectCollection(collectionRef, new List<IEdmEntityObject>());
        }

        [TestCase]
        public void Can_GetEdmStructuralProperty()
        {
            RowsEdmBusinessLogic testingBusinessLogic = new RowsEdmBusinessLogic(_appServerProxy.Object);
            IEnumerable<IEdmStructuralProperty> properties = testingBusinessLogic.GetEdmStructuralProperty(new Mock<IEdmEntityType>().Object);

            Assert.IsNotNull(properties);
        }

        #endregion

        #region private functions

        private void TestThrowConvertValue()
        {
            FieldMap fieldMap = new FieldMap { IsTime = true, NeedsConversion = true };
            _testingBusinessLogic.ConvertValue(9999999999999999999, fieldMap);
        }

        private void TestThrowGetEdmEntityObjectCollection()
        {
            RowsEdmBusinessLogic testingBusinessLogic = new RowsEdmBusinessLogic(_appServerProxy.Object);
            IEdmCollectionTypeReference reference = testingBusinessLogic.GetEdmCollectionTypeReference(new Mock<IEdmCollectionType>().Object, true);
            EdmEntityObjectCollection collection = testingBusinessLogic.GetEdmEntityObjectCollection(reference, new Mock<IList<IEdmEntityObject>>().Object);
        }

        #endregion
    }
}
