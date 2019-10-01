using EveryAngle.OData.Builder.ControllerSelectors;
using EveryAngle.OData.Builder.Metadata;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.ODataControllers;
using EveryAngle.OData.Proxy;
using Microsoft.Data.Edm.Library;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace EveryAngle.OData.Tests.BuilderTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Builder")]
    public class ModelBuilderTests : UnitTestBase
    {
        #region private variables

        private readonly Mock<IMasterEdmModelBusinessLogic> _edmModelBusinessLogic = new Mock<IMasterEdmModelBusinessLogic>();
        private Mock<IAppServerProxy> _appServerProxy = new Mock<IAppServerProxy>();
        private ModelBuilder _modelBuilderTest;

        #endregion

        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
            IRoutingControllerSelector selector = new RoutingControllerSelector(_edmModelBusinessLogic.Object, new HttpConfiguration());
            _modelBuilderTest = new ModelBuilder(_edmModelBusinessLogic.Object, selector, typeof(RowsController), _appServerProxy.Object);
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase(false, true)]
        [TestCase(true, false)]
        public void Can_BuildModel_SetAngleUnavailable(bool published, bool valid)
        {
            Angle angle = new Angle();
            _edmModelBusinessLogic.Setup(x => x.GetAngles()).Returns(new List<Angle> { angle });
            _appServerProxy.Setup(x => x.GetAngle(It.IsAny<string>(), null)).Returns(new Angle
            {
                id = "angle1",
                is_published = published,
                query_definition = new List<QueryDefinition>
                {
                    new QueryDefinition { valid = valid }
                },
                display_definitions = new List<Display>()
            });

            _modelBuilderTest.BuildModel();

            Assert.IsFalse(angle.is_available);
        }
        
        [TestCase(false, false)]
        [TestCase(true, true)]
        public void Can_BuildModel_SetDisplayUnavailable(bool isPublic, bool expectedAngle)
        {
            Angle angle = new Angle();
            Display display = new Display
            {
                is_angle_default = true,
                is_public = isPublic,
                fields = new List<Field> { new Field { valid = true } }
            };
            _edmModelBusinessLogic.Setup(x => x.GetAngles()).Returns(new List<Angle> { angle });
            _appServerProxy.Setup(x => x.GetAngle(It.IsAny<string>(), null)).Returns(new Angle
            {
                id = "angle1",
                is_published = true,
                query_definition = new List<QueryDefinition>(),
                display_definitions = new List<Display> { display }
            });

            _modelBuilderTest.BuildModel();

            Assert.AreEqual(expectedAngle, angle.is_available);
            Assert.IsFalse(display.is_available);
        }

        [TestCase(false)]
        [TestCase(true)]
        public void Can_BuildModel(bool hasAggregation)
        {
            Angle angle = new Angle { name = "angle1" };
            Display display = new Display
            {
                uri = "/models/1/angles/1/displays/1",
                name = "display1",
                display_type = "pivot",
                is_angle_default = true,
                is_public = true,
                fields = new List<Field> { new Field { id = "count", valid = true } },
                contained_aggregation_steps = hasAggregation,
                query_blocks = new List<QueryBlock>
                {
                    new QueryBlock
                    {
                        query_steps = new List<QueryStep>
                        {
                            new QueryStep
                            {
                                step_type = "aggregation"
                            }
                        }
                    }
                }
            };
            _edmModelBusinessLogic.Setup(x => x.GetAngles()).Returns(new List<Angle> { angle });
            _appServerProxy
                .Setup(x => x.GetAngle(It.IsAny<string>(), null))
                .Returns(new Angle
                {
                    id = "angle1",
                    is_published = true,
                    query_definition = new List<QueryDefinition>(),
                    display_definitions = new List<Display> { display }
                });
            _appServerProxy
                .Setup(x => x.GetModelFields(It.IsAny<string>(), It.IsAny<List<string>>(), null))
                .Returns(new Fields { fields = new List<Field>() });

            _modelBuilderTest.BuildModel();

            Assert.IsTrue(angle.is_available);
            Assert.IsTrue(display.is_available);
        }

        [TestCase]
        public void Can_UpdateListDisplayFields()
        {
            Display display = new Display
            {
                fields = new List<Field>
                {
                    new Field { id = "field1" },
                    new Field { id = "field2" }
                }
            };
            _edmModelBusinessLogic
                .Setup(x => x.TryGetField(It.IsAny<FieldCompositeKey>(), out It.Ref<Field>.IsAny))
                .Returns(new TryGetField((FieldCompositeKey key, out Field outField) =>
                {
                    outField = new Field
                    {
                        id = "field2",
                        fieldtype = "text"
                    };
                    return true;
                }));

            _modelBuilderTest.UpdateListDisplayFields(display);

            Assert.AreEqual(2, display.fields.Count);
            Assert.IsNull(display.fields[0].fieldtype);
            Assert.IsNotNull(display.fields[1].fieldtype);
        }

        [TestCase]
        public void Can_UpdateCubeDisplayFields()
        {
            Display display = new Display
            {
                fields = new List<Field>
                {
                    new Field { id = "field1_individual" },
                    new Field { id = "field2_individual" },
                    new Field { id = "field3_average" },
                    new Field { id = "field3_max" },
                    new Field { id = "count" }
                },
                query_blocks = new List<QueryBlock>
                {
                    new QueryBlock {
                        query_steps = new List<QueryStep>
                        {
                            new QueryStep {
                                step_type = "aggregation",
                                grouping_fields = new List<GroupingField>
                                {
                                    new GroupingField { field = "field1_individual", @operator = "individual", source_field = "field1" },
                                    new GroupingField { field = "field2_individual", @operator = "individual", source_field = "field2" }
                                },
                                aggregation_fields = new List<AggregationField>
                                {
                                    new AggregationField { field = "field3_average", @operator = "average", source_field = "field3" },
                                    new AggregationField { field = "field3_max", @operator = "max", source_field = "field3" },
                                    new AggregationField { field = "count" }
                                }
                            }
                        }
                    }
                }
            };
            _edmModelBusinessLogic
                .Setup(x => x.TryGetField(It.IsAny<FieldCompositeKey>(), out It.Ref<Field>.IsAny))
                .Returns(new TryGetField((FieldCompositeKey key, out Field outField) =>
                {
                    outField = new Field
                    {
                        id = key.BusinessId != "field2" ? key.BusinessId : "field2_new",
                        fieldtype = "text"
                    };
                    return true;
                }));

            _modelBuilderTest.UpdateCubeDisplayFields(display);

            Assert.AreEqual(5, display.fields.Count);
            Assert.IsNotNull(display.fields[0].fieldtype);
            Assert.IsNull(display.fields[1].fieldtype);
            Assert.IsNotNull(display.fields[2].fieldtype);
            Assert.IsNotNull(display.fields[3].fieldtype);
            Assert.IsNotNull(display.fields[4].fieldtype);
        }

        [TestCase]
        public void Can_GetCachedModelFields()
        {
            string[] fields = new string[] { "field1", "field2", "field3" };
            _edmModelBusinessLogic
                .Setup(x => x.TryGetField(It.IsAny<FieldCompositeKey>(), out It.Ref<Field>.IsAny))
                .Returns(new TryGetField((FieldCompositeKey key, out Field outField) =>
                {
                    outField = new Field
                    {
                        id = key.BusinessId
                    };
                    return key.BusinessId == "field1";
                }));
            _appServerProxy
                .Setup(x => x.GetModelFields(It.IsAny<string>(), It.IsAny<List<string>>(), null))
                .Returns(new Fields
                {
                    fields = new List<Field>
                    {
                        new Field { id = "field2" }
                    }
                });

            List<Field> result = _modelBuilderTest.GetCachedModelFields(fields);

            Assert.AreEqual(3, result.Count);
        }

        [TestCase]
        public void Can_GetDisplayEntityType()
        {
            Display display = new Display
            {
                fields = new List<Field>
                {
                    new Field { id = "ID", valid = true, short_name = "field 1" },
                    new Field { id = "AnotherField1", valid = true, short_name = "field 2" },
                    new Field { id = "AnotherField2", valid = true, short_name = "field 3" }
                }
            };
            EdmEntityType result = _modelBuilderTest.GetDisplayEntityType(display, "name1", "1");

            Assert.AreEqual(1, result.DeclaredKey.Count());
            Assert.AreEqual(3, result.DeclaredProperties.Count());
        }

        [TestCase(false, 0)]
        [TestCase(true, 1)]
        public void Can_GetAngleQuerySteps(bool hasDefinition, int expected)
        {
            Angle angle = new Angle
            {
                query_definition = !hasDefinition ? null : new List<QueryDefinition>
                {
                    new QueryDefinition
                    {
                        query_steps = new List<QueryStep>
                        {
                            new QueryStep()
                        }
                    }
                }
            };
            IList<QueryStep> result = _modelBuilderTest.GetAngleQuerySteps(angle);

            Assert.AreEqual(expected, result.Count);
        }

        [TestCase(false, "angle1", true, false)]
        [TestCase(true, null, true, false)]
        [TestCase(true, "angle1", false, false)]
        [TestCase(true, "angle1", true, true)]
        public void Can_IsAngleUsable(bool hasAngle, string id, bool isPublished, bool expected)
        {
            Angle angleDetails = !hasAngle ? null : new Angle
            {
                id = id,
                is_published = isPublished
            };

            bool result = _modelBuilderTest.IsAngleUsable(angleDetails);

            Assert.AreEqual(expected, result);
        }
        
        [TestCase(true, 1, true, true, true)]
        [TestCase(false, 2, false, true, false)]
        [TestCase(false, 1, false, false, false)]
        public void Can_IsDisplayUsable(bool isPublic, int displayCount, bool expectedUsable, bool expectedAngle, bool expectedDisplay)
        {
            Angle angle = new Angle
            {
                display_definitions = new List<Display>()
            };
            for (int i = 0; i < displayCount; i++)
                angle.display_definitions.Add(new Display());
            Display display = new Display
            {
                is_angle_default = true,
                is_public = isPublic,
                fields = new List<Field> { new Field { valid = true } },
                query_blocks = new List<QueryBlock>()
            };

            bool result = _modelBuilderTest.IsDisplayUsable(angle, display);

            Assert.AreEqual(expectedUsable, result);
            Assert.AreEqual(expectedAngle, angle.is_available);
            Assert.AreEqual(expectedDisplay, display.is_available);
        }

        [TestCase(true, true)]
        [TestCase(false, false)]
        public void Can_ContainsValidFields(bool validField, bool expected)
        {
            Display display = new Display
            {
                fields = new List<Field>
                {
                    new Field { valid = validField }
                }
            };
            bool result = _modelBuilderTest.ContainsValidFields(display);

            Assert.AreEqual(expected, result);
        }

        [TestCase(false, true, true, true)]
        [TestCase(true, true, true, true)]
        [TestCase(true, null, true, true)]
        [TestCase(true, true, null, true)]
        [TestCase(true, false, true, false)]
        [TestCase(true, true, false, false)]
        public void Can_IsAggregationValid(bool hasAggregation, bool? validAggregation, bool? validGrouping, bool expected)
        {
            Display display = new Display
            {
                contained_aggregation_steps = hasAggregation,
                query_blocks = new List<QueryBlock>
                {
                    new QueryBlock
                    {
                        query_steps = new List<QueryStep>
                        {
                            new QueryStep {
                                step_type = "aggregation",
                                aggregation_fields = new List<AggregationField>
                                {
                                    new AggregationField { valid = validAggregation }
                                },
                                grouping_fields = new List<GroupingField>
                                {
                                    new GroupingField { valid = validGrouping }
                                }
                            }
                        }
                    }
                }
            };
            bool result = _modelBuilderTest.IsAggregationValid(display);

            Assert.AreEqual(expected, result);
        }

        [TestCase(true, true)]
        [TestCase(null, true)]
        [TestCase(false, false)]
        public void Can_IsQueryStepsValid(bool? validStep, bool expected)
        {
            Display display = new Display
            {
                query_blocks = new List<QueryBlock>
                {
                    new QueryBlock
                    {
                        query_steps = new List<QueryStep>
                        {
                            new QueryStep { valid = validStep }
                        }
                    }
                }
            };
            bool result = _modelBuilderTest.IsQueryStepsValid(display);

            Assert.AreEqual(expected, result);
        }

        [TestCase(true, true, false)]
        [TestCase(null, true, false)]
        [TestCase(true, null, false)]
        [TestCase(false, true, true)]
        [TestCase(true, false, true)]
        public void Can_ContainsInvalidAngleQueryDefinition(bool? validBlock, bool? validStep, bool expected)
        {
            Angle angle = new Angle
            {
                query_definition = new List<QueryDefinition>
                {
                    new QueryDefinition { valid = validBlock },
                    new QueryDefinition
                    {
                        query_steps = new List<QueryStep> { new QueryStep { valid = validStep } }
                    }
                }
            };
            bool result = _modelBuilderTest.ContainsInvalidAngleQueryDefinition(angle);

            Assert.AreEqual(expected, result);
        }

        [TestCase(true, false)]
        [TestCase(false, true)]
        public void Can_ContainsInvalidDefaultDisplay(bool validField, bool expected)
        {
            Angle angle = new Angle
            {
                display_definitions = new List<Display>
                {
                    new Display
                    {
                        is_angle_default = true,
                        fields = new List<Field>
                        {
                            new Field { valid = validField }
                        }
                    }
                }
            };
            bool result = _modelBuilderTest.ContainsInvalidDefaultDisplay(angle);

            Assert.AreEqual(expected, result);
        }

        [TestCase(false, true, false)]
        [TestCase(true, true, false)]
        [TestCase(true, false, true)]
        public void Can_ContainsOnlyPrivateDisplays(bool hasDisplay, bool isPublic, bool expected)
        {
            Angle angle = new Angle
            {
                displays_summary = !hasDisplay ? null : new List<DisplaysSummary>
                {
                    new DisplaysSummary
                    {
                        is_public = isPublic
                    }
                }
            };
            bool result = _modelBuilderTest.ContainsOnlyPrivateDisplays(angle);

            Assert.AreEqual(expected, result);
        }

        #endregion

        #region private method

        delegate bool TryGetField(FieldCompositeKey key, out Field outField);

        #endregion
    }
}
