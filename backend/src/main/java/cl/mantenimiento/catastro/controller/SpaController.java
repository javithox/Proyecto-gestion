package cl.mantenimiento.catastro.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    @GetMapping({"/", "/login", "/perfil"})
    public String index() { return "forward:/index.html"; }
}
