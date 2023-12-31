import { Component, OnInit, ViewChild } from "@angular/core";
import { TaskService } from "../../shared/service/task.service";
import { Task } from "../../shared/model/task";
import { Language } from "../../shared/model/language.enum";
import { ActivatedRoute, Router } from "@angular/router";
import { SketchComponent } from "../sketch/sketch.component";
import { Group } from "../../shared/model/group.enum";
import { MessageService } from "../../shared/service/message.service";
import { RecordingService } from "../../shared/service/recording.service";

@Component({
    selector: "app-task",
    templateUrl: "./task.component.html",
    styleUrls: ["./task.component.scss"],
})
export class TaskComponent implements OnInit {
    @ViewChild(SketchComponent) private sketchComponent!: SketchComponent;

    currentTask: Task | undefined;

    protected readonly Language = Language;
    protected readonly Group = Group;

    constructor(
        private taskService: TaskService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService,
        private recordingService: RecordingService,
    ) {}

    ngOnInit() {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;

        this.route.params.subscribe((params) => {
            const taskNumber = +params["taskNumber"];
            this.currentTask = this.taskService.loadedTasks?.find((task) => task.taskNumber === taskNumber);

            if (this.currentTask) {
            } else {
                this.messageService.taskNotFound();
            }
        });
    }

    clickPreviousPage() {
        if (this.currentTask!.taskNumber === 1) {
            this.messageService.alreadyFirstPage();
        } else {
            this.router.navigate(["/questionnaire/" + (this.currentTask!.taskNumber - 1).toString()]);
        }
    }

    clickExitStudy() {
        this.router.navigate(["/demographics"]);
    }

    clickResetPage() {
        this.saveData();
    }

    async clickNextPage() {
        if (this.sketchComponent.capturedLines.length == 0) {
            this.messageService.notEditedPage(this.currentTask!.language);
        } else {
            await this.saveData();
            this.router.navigate(["/questionnaire/" + this.currentTask!.taskNumber.toString()]);
        }
    }

    async clickSkipTask() {
        this.sketchComponent.saveSkip(
            `${this.currentTask?.taskNumber}_task_skip${this.currentTask?.id}_resets${this.currentTask?.resets}`,
        );
        if (this.currentTask?.taskNumber === this.taskService.loadedTasks.length) {
            this.router.navigate(["/demographics"]);
        } else {
            this.router.navigate(["/task/" + (this.currentTask!.taskNumber + 1).toString()]);
        }
    }

    async saveData() {
        if (!this.recordingService.recordingNotSupported()) {
            await this.recordingService.takeScreenshot(
                `${this.currentTask?.taskNumber}_screenshot${this.currentTask?.id}_resets${this.currentTask?.resets}.png`,
                this.recordingService.getScreenStream()!,
            );
        } else {
        }
        this.sketchComponent.saveTask(
            `${this.currentTask?.taskNumber}_task_detail${this.currentTask?.id}_resets${this.currentTask?.resets}`,
        );
        this.sketchComponent.saveDrawing(
            `${this.currentTask?.taskNumber}_drawing_task${this.currentTask?.id}_resets${this.currentTask?.resets}`,
        );
    }
}
