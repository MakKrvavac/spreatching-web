import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TaskService } from "../../shared/service/task.service";
import { Task } from "../../shared/model/task";
import { Language } from "../../shared/model/language.enum";
import { ActivatedRoute, Router } from "@angular/router";
import { SketchComponent } from "../sketch/sketch.component";

@Component({
    selector: "app-playground",
    templateUrl: "./playground.component.html",
    styleUrls: ["./playground.component.scss"],
})
export class PlaygroundComponent implements OnInit {
    @ViewChild(SketchComponent) private sketchComponent!: SketchComponent;

    tasks: Task[] | undefined;
    //TODO: do we need this? We can use tasks[id] instead
    currentTask: Task | undefined;

    protected readonly Language = Language;

    constructor(
        private taskService: TaskService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        //TODO: Load tasks once, and save it globally
        this.tasks = this.taskService.initData(Language.GERMAN);
        const taskNumber = +this.route.snapshot.params["taskNumber"];
        this.currentTask = this.tasks?.find((task) => task.taskNumber === taskNumber);

        if (this.currentTask) {
            console.log(this.currentTask);
        } else {
            console.log("Aufgabe nicht gefunden");
        }
    }

    clickPreviousPage() {
        if (this.currentTask!.taskNumber === 2) {
            //TODO: Router works, but data is not refreshed
            this.router.navigate(["/playground/" + (this.currentTask!.taskNumber - 1).toString()]);
        }
        if (this.currentTask!.taskNumber === 1) {
            this.router.navigate(["/welcome"]);
        }
    }
    clickResetPage() {
        this.sketchComponent.resetDrawing();
    }
    clickNextPage() {
        this.sketchComponent.saveDrawing();
        if (this.currentTask!.taskNumber === 2) {
            this.router.navigate(["/task/" + (this.currentTask!.taskNumber + 1).toString()]);
        }
        if (this.currentTask!.taskNumber === 1) {
            this.router.navigate(["/playground/" + (this.currentTask!.taskNumber + 1).toString()]);
        }
    }
}
