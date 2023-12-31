import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TaskService } from "../../shared/service/task.service";
import { Task } from "../../shared/model/task";
import { Language } from "../../shared/model/language.enum";
import { ActivatedRoute } from "@angular/router";
import { DataStorageService } from "../../shared/service/data.storage.service";
import { MessageService } from "../../shared/service/message.service";

@Component({
    selector: "app-sketch",
    templateUrl: "./sketch.component.html",
    styleUrls: ["./sketch.component.scss"],
})
export class SketchComponent implements OnInit {
    @ViewChild("backgroundImage") backgroundImage!: ElementRef;
    @ViewChild("drawingCanvas", { static: false }) drawingCanvas!: ElementRef;

    backgroundImageUrlDE = "./assets/Spreadsheet_DE.png";
    backgroundImageUrlEN = "./assets/Spreadsheet_EN.png";
    canvas: HTMLCanvasElement | null = null;
    context: CanvasRenderingContext2D | null = null;
    drawing = false;

    capturedLines: Array<Array<{ x: number; y: number }>> = [];
    currentLine: { x: number; y: number }[] = [];

    tasks: Task[] | undefined;
    currentTask: Task | undefined;

    protected readonly Language = Language;

    constructor(
        private taskService: TaskService,
        private route: ActivatedRoute,
        private dataStorageService: DataStorageService,
        private messageService: MessageService,
    ) {}

    ngOnInit() {
        this.capturedLines = [];
        this.tasks = this.taskService.loadedTasks;
        const taskNumber = +this.route.snapshot.params["taskNumber"];
        this.currentTask = this.tasks?.find((task) => task.taskNumber === taskNumber);

        if (this.currentTask) {
            console.log("Current Task: ", this.currentTask.id);
            this.currentTask.startTimeWatching = new Date();
        } else {
            this.messageService.taskNotFound();
        }
    }

    onImageLoad() {
        this.canvas = this.drawingCanvas.nativeElement;
        this.context = this.canvas!.getContext("2d");

        if (this.context && this.canvas) {
            this.canvas.width = this.backgroundImage.nativeElement.width;
            this.canvas.height = this.backgroundImage.nativeElement.height;

            this.context.strokeStyle = "blue";
            this.context.lineWidth = 2;
        }
    }

    onMouseDown(event: MouseEvent | Touch) {
        this.currentTask!.endTimeWatching = new Date();
        this.currentTask!.timeWatching =
            this.currentTask!.endTimeWatching.getTime() - this.currentTask!.startTimeWatching.getTime();
        this.currentTask!.startTimeDrawing = new Date();

        if (this.context && this.canvas) {
            this.drawing = true;
            const x =
                "offsetX" in event
                    ? (event as MouseEvent).offsetX
                    : (event as Touch).clientX - this.canvas.getBoundingClientRect().left;
            const y =
                "offsetY" in event
                    ? (event as MouseEvent).offsetY
                    : (event as Touch).clientY - this.canvas.getBoundingClientRect().top;
            this.context.beginPath();
            this.context.moveTo(x, y);
        }
    }

    onMouseMove(event: MouseEvent | Touch) {
        if (this.drawing && this.canvas) {
            const x =
                "offsetX" in event
                    ? (event as MouseEvent).offsetX
                    : (event as Touch).clientX - this.canvas.getBoundingClientRect().left;
            const y =
                "offsetY" in event
                    ? (event as MouseEvent).offsetY
                    : (event as Touch).clientY - this.canvas.getBoundingClientRect().top;
            const point = { x, y };
            this.currentLine.push(point);
            this.drawOnCanvas();
        }
    }

    drawOnCanvas() {
        if (this.context) {
            this.context.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
            for (const line of this.capturedLines) {
                if (line.length > 1) {
                    this.context.beginPath();
                    this.context.moveTo(line[0].x, line[0].y);
                    for (let i = 1; i < line.length; i++) {
                        this.context.lineTo(line[i].x, line[i].y);
                    }
                    this.context.stroke();
                }
            }
            // Zeichnen der aktuellen Linie (live)
            if (this.currentLine.length > 1) {
                this.context.beginPath();
                this.context.moveTo(this.currentLine[0].x, this.currentLine[0].y);
                for (let i = 1; i < this.currentLine.length; i++) {
                    this.context.lineTo(this.currentLine[i].x, this.currentLine[i].y);
                }
                this.context.stroke();
            }
        }
    }

    onMouseUp() {
        if (this.drawing) {
            this.drawing = false;
            this.capturedLines.push(this.currentLine);
            this.currentLine = [];
        }
    }

    saveSkip(fileName: string) {
        this.dataStorageService.saveData(
            `${fileName}.json`,
            new Blob([JSON.stringify({ skipped: true }, null, 2)], { type: "application/json" }),
        );
    }

    saveTask(fileName: string) {
        this.currentTask!.endTimeDrawing = new Date();
        this.currentTask!.timeDrawing =
            this.currentTask!.endTimeDrawing.getTime() - this.currentTask!.startTimeDrawing.getTime();

        this.dataStorageService.saveData(
            `${fileName}.json`,
            new Blob([JSON.stringify(this.currentTask, null, 2)], { type: "application/json" }),
        );
    }

    saveDrawing(fileName: string) {
        if (this.canvas && this.context) {
            const saveCanvas = document.createElement("canvas");
            const saveContext = saveCanvas.getContext("2d");
            if (saveContext) {
                saveCanvas.width = this.canvas.width;
                saveCanvas.height = this.canvas.height;

                // Zeichnen Sie das backgroundImage auf den saveCanvas
                const image = new Image();
                image.src =
                    this.currentTask?.language === Language.GERMAN
                        ? this.backgroundImageUrlDE
                        : this.backgroundImageUrlEN;
                saveContext.drawImage(image, 0, 0, 1186, 576);

                this.drawLinesOnCanvas(saveContext);

                saveCanvas.toBlob((blob) => {
                    this.dataStorageService.saveData(`${fileName}.png`, blob);
                });
                this.dataStorageService.saveData(
                    `${fileName}.json`,
                    new Blob([JSON.stringify(this.capturedLines, null, 2)], { type: "application/json" }),
                );

                //Clean up
                saveCanvas.remove();
            }
        }
        this.resetDrawing();
    }

    drawLinesOnCanvas(saveContext: CanvasRenderingContext2D) {
        // Zeichnen Sie die Linien auf das Bild
        for (const line of this.capturedLines) {
            saveContext.beginPath();
            saveContext.moveTo(line[0].x, line[0].y);
            for (let i = 1; i < line.length; i++) {
                saveContext.lineTo(line[i].x, line[i].y);
            }
            saveContext.strokeStyle = this.context!.strokeStyle as string;
            saveContext.lineWidth = this.context!.lineWidth;
            saveContext.stroke();
        }
    }

    resetDrawing() {
        console.log("Reset drawings...");
        this.currentTask!.resets = this.currentTask!.resets + 1;
        this.currentTask!.startTimeWatching = new Date();
        this.capturedLines = [];
        this.drawOnCanvas();
    }

    /**
     * Tablet Section
     */

    onTouchStart(event: TouchEvent) {
        event.preventDefault(); // Verhindert das Scrollen der Seite bei Touch-Events
        const touch = event.touches[0];
        this.onMouseDown(touch);
    }

    onTouchMove(event: TouchEvent) {
        event.preventDefault();
        const touch = event.touches[0];
        this.onMouseMove(touch);
    }

    onTouchEnd(event: TouchEvent) {
        event.preventDefault();
        this.onMouseUp();
    }
}
