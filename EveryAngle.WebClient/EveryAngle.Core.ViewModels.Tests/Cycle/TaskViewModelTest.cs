using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Remoting;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class TaskViewModelTest : UnitTestBase
    {
        [TestCase]
        public void TaskViewModel_TEST()
        {
            //arrange
            TaskViewModel viewModel = new TaskViewModel
            {
                actions = new List<TaskAction>(),
                action_count = 3,
                run_as_user = "EAAdmin",
                Triggers = new List<TriggerViewModel>(),
                description = "description",
                id = "id",
                last_run_result = "last run result",
                last_run_time = 25871589,
                next_run_time = 15245478,
                name = "name",
                delete_after_completion = true,
                status = "status",
                enabled = true,
                created = new UserDateViewModel(),
                changed = new UserDateViewModel(),
                max_run_time = 2,
                start_immediately = true,
            };

            AssertTaskViewModel(viewModel);
        }

        [TestCase]
        public void TriggerViewModel_TEST()
        {
            //arrange
            TriggerViewModel viewModel = new TriggerViewModel
            {
                days = new List<DaysList>(),
                trigger_type = "trigger type",
                continuous = true,
                frequency = "frequency",
                start_time = 123,
                restart_delay = 1,
                end_time = 234,
                task_event = "task event",
                arguments = new List<EveryAngle.Core.ViewModels.Cycle.Argument>()
            };

            AssertTriggerViewModel(viewModel);
        }

        [TestCase]
        public void DaysList_TEST()
        {
            //arrange
            DaysList viewModel = new DaysList
            {
                day = 1,
                active = true
            };

            //assert type
            Assert.AreEqual(viewModel.day.GetType(), typeof(int));
            Assert.AreEqual(viewModel.active.GetType(), typeof(bool));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("day"));
            Assert.IsTrue(viewModelSerialize.Contains("active"));
        }

        [TestCase]
        public void Action_TEST()
        {
            //arrange
            TaskAction viewModel = new TaskAction
            {
                action_type = "action type",
                arguments = new List<EveryAngle.Core.ViewModels.Cycle.Argument>(),
                run_as_user = "EAAdmin",
                approval_state = "approval",
                order = 1,
                notification = new Notification(),
                AngleName = "angle name",
                DisplayName = "display name",
                Angle = "angle"
            };

            AssertAction(viewModel);
        }

        [TestCase]
        public void Notification_TEST()
        {
            //arrange
            Notification viewModel = new Notification
            {
                notification_type = "notification type",
                subject = "subject",
                body = "body",
                recipients = new List<Recipients>(),
                attach_result = true
            };

            //assert type
            Assert.AreEqual(viewModel.notification_type.GetType(), typeof(string));
            Assert.AreEqual(viewModel.subject.GetType(), typeof(string));
            Assert.AreEqual(viewModel.body.GetType(), typeof(string));
            Assert.AreEqual(viewModel.recipients.GetType(), typeof(List<Recipients>));
            Assert.AreEqual(viewModel.attach_result.GetType(), typeof(bool));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("notification_type"));
            Assert.IsTrue(viewModelSerialize.Contains("subject"));
            Assert.IsTrue(viewModelSerialize.Contains("body"));
            Assert.IsTrue(viewModelSerialize.Contains("recipients"));
            Assert.IsTrue(viewModelSerialize.Contains("attach_result"));
        }

        [TestCase]
        public void Argument_TEST()
        {
            //arrange
            EveryAngle.Core.ViewModels.Cycle.Argument viewModel = new EveryAngle.Core.ViewModels.Cycle.Argument
            {
                name = "test",
                value = "value"
            };

            //assert type
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("value"));
        }

        [TestCase]
        public void Recipients_TEST()
        {
            //arrange
            EveryAngle.Core.ViewModels.Cycle.Recipients viewModel = new EveryAngle.Core.ViewModels.Cycle.Recipients
            {
                email_address = "email",
                result = true,
                success = true,
                failed = false
            };

            //assert type
            Assert.AreEqual(viewModel.email_address.GetType(), typeof(string));
            Assert.AreEqual(viewModel.result.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.success.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.failed.GetType(), typeof(bool));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("email_address"));
            Assert.IsTrue(viewModelSerialize.Contains("result"));
            Assert.IsTrue(viewModelSerialize.Contains("success"));
            Assert.IsTrue(viewModelSerialize.Contains("failed"));
        }

        #region Private

        private static void AssertAction(TaskAction viewModel)
        {
            //assert type
            Assert.AreEqual(viewModel.action_type.GetType(), typeof(string));
            Assert.AreEqual(viewModel.arguments.GetType(), typeof(List<EveryAngle.Core.ViewModels.Cycle.Argument>));
            Assert.AreEqual(viewModel.run_as_user.GetType(), typeof(string));
            Assert.AreEqual(viewModel.approval_state.GetType(), typeof(string));
            Assert.AreEqual(viewModel.order.GetType(), typeof(int));
            Assert.AreEqual(viewModel.notification.GetType(), typeof(Notification));
            Assert.AreEqual(viewModel.AngleName.GetType(), typeof(string));
            Assert.AreEqual(viewModel.DisplayName.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Angle.GetType(), typeof(string));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("action_type"));
            Assert.IsTrue(viewModelSerialize.Contains("arguments"));
            Assert.IsTrue(viewModelSerialize.Contains("run_as_user"));
            Assert.IsTrue(viewModelSerialize.Contains("approval_state"));
            Assert.IsTrue(viewModelSerialize.Contains("order"));
            Assert.IsTrue(viewModelSerialize.Contains("notification"));
            Assert.IsTrue(viewModelSerialize.Contains("AngleName"));
            Assert.IsTrue(viewModelSerialize.Contains("DisplayName"));
            Assert.IsTrue(viewModelSerialize.Contains("Angle"));
        }

        private static void AssertTriggerViewModel(TriggerViewModel viewModel)
        {
            //assert type
            Assert.AreEqual(viewModel.days.GetType(), typeof(List<DaysList>));
            Assert.AreEqual(viewModel.trigger_type.GetType(), typeof(string));
            Assert.AreEqual(viewModel.continuous.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.frequency.GetType(), typeof(string));
            Assert.AreEqual(viewModel.start_time.GetType(), typeof(int));
            Assert.AreEqual(viewModel.restart_delay.GetType(), typeof(int));
            Assert.AreEqual(viewModel.end_time.GetType(), typeof(int));
            Assert.AreEqual(viewModel.task_event.GetType(), typeof(string));
            Assert.AreEqual(viewModel.arguments.GetType(), typeof(List<EveryAngle.Core.ViewModels.Cycle.Argument>));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("days"));
            Assert.IsTrue(viewModelSerialize.Contains("trigger_type"));
            Assert.IsTrue(viewModelSerialize.Contains("continuous"));
            Assert.IsTrue(viewModelSerialize.Contains("frequency"));
            Assert.IsTrue(viewModelSerialize.Contains("start_time"));
            Assert.IsTrue(viewModelSerialize.Contains("restart_delay"));
            Assert.IsTrue(viewModelSerialize.Contains("end_time"));
            Assert.IsTrue(viewModelSerialize.Contains("event"));
            Assert.IsTrue(viewModelSerialize.Contains("arguments"));
        }

        private static void AssertTaskViewModel(TaskViewModel viewModel)
        {
            //assert type
            Assert.AreEqual(viewModel.actions.GetType(), typeof(List<TaskAction>));
            Assert.AreEqual(viewModel.action_count.GetType(), typeof(int));
            Assert.AreEqual(viewModel.run_as_user.GetType(), typeof(string));
            Assert.AreEqual(viewModel.Triggers.GetType(), typeof(List<TriggerViewModel>));
            Assert.AreEqual(viewModel.description.GetType(), typeof(string));
            Assert.AreEqual(viewModel.id.GetType(), typeof(string));
            Assert.AreEqual(viewModel.last_run_result.GetType(), typeof(string));
            Assert.AreEqual(viewModel.last_run_time.GetType(), typeof(long));
            Assert.AreEqual(viewModel.next_run_time.GetType(), typeof(long));
            Assert.AreEqual(viewModel.name.GetType(), typeof(string));
            Assert.AreEqual(viewModel.delete_after_completion.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.status.GetType(), typeof(string));
            Assert.AreEqual(viewModel.enabled.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.created.GetType(), typeof(UserDateViewModel));
            Assert.AreEqual(viewModel.changed.GetType(), typeof(UserDateViewModel));
            Assert.AreEqual(viewModel.max_run_time.GetType(), typeof(int));
            Assert.AreEqual(viewModel.start_immediately.GetType(), typeof(bool));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("actions"));
            Assert.IsTrue(viewModelSerialize.Contains("action_count"));
            Assert.IsTrue(viewModelSerialize.Contains("run_as_user"));
            Assert.IsTrue(viewModelSerialize.Contains("triggers"));
            Assert.IsTrue(viewModelSerialize.Contains("description"));
            Assert.IsTrue(viewModelSerialize.Contains("history"));
            Assert.IsTrue(viewModelSerialize.Contains("id"));
            Assert.IsTrue(viewModelSerialize.Contains("last_run_result"));
            Assert.IsTrue(viewModelSerialize.Contains("last_run_time"));
            Assert.IsTrue(viewModelSerialize.Contains("next_run_time"));
            Assert.IsTrue(viewModelSerialize.Contains("name"));
            Assert.IsTrue(viewModelSerialize.Contains("delete_after_completion"));
            Assert.IsTrue(viewModelSerialize.Contains("status"));
            Assert.IsTrue(viewModelSerialize.Contains("enabled"));
            Assert.IsTrue(viewModelSerialize.Contains("created"));
            Assert.IsTrue(viewModelSerialize.Contains("changed"));
            Assert.IsTrue(viewModelSerialize.Contains("max_run_time"));
            Assert.IsTrue(viewModelSerialize.Contains("start_immediately"));
        }

        #endregion
    }
}
