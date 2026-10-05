package com.proyecto.incidenciasback;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class IncidenciasbackApplication {

	public static void main(String[] args) {
		SpringApplication.run(IncidenciasbackApplication.class, args);
	}

}
