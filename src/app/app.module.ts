import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TaskComponent } from "./component/task/task.component";
import { WelcomeComponent } from "./component/welcome/welcome.component";
import { QuestionnaireComponent } from "./component/questionnaire/questionnaire.component";
import { AcknowledgementComponent } from "./component/acknowledgement/acknowledgement.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatGridListModule } from "@angular/material/grid-list";
import { TaskService } from "./shared/service/task.service";
import { DemographicsComponent } from "./component/demographics/demographics.component";
import { SketchComponent } from "./component/sketch/sketch.component";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { FormsModule } from "@angular/forms";

@NgModule({
    declarations: [
        AppComponent,
        TaskComponent,
        WelcomeComponent,
        QuestionnaireComponent,
        AcknowledgementComponent,
        DemographicsComponent,
        SketchComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatIconModule,
        MatGridListModule,
        MatSnackBarModule,
        FormsModule,
    ],
    providers: [TaskService],
    bootstrap: [AppComponent],
})
export class AppModule {}
