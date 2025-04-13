package com.example.backend.Config;

import com.example.backend.Entity.*;
import com.example.backend.Enums.UserRoles;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

@Configuration
@RequiredArgsConstructor
public class AutoRun implements CommandLineRunner {

    private final RoleRepo roleRepo;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final EducationTypeRepo educationTypeRepo;
    private final FacultyRepo  facultyRepo;
    private final FacultySubjectRepo facultySubjectRepo;
    @Override
    public void run(String... args) throws Exception {
        String adminPhone = "admin1234";
        if (roleRepo.findAll().isEmpty()) {
            List<Role> savedRoles = saveRoles();
        }
        if(educationTypeRepo.findAll().isEmpty()) {
            EducationType newEducationType1 = new EducationType(1, "Bakalavr");
            EducationType newEducationType2 = new EducationType(2, "Magistr");
            educationTypeRepo.save(newEducationType1);
            educationTypeRepo.save(newEducationType2);
        }
        if (facultyRepo.findAll().isEmpty()) {
            List<Faculty> faculties = List.of(
                     new Faculty(1,"60310300", "Psixologiya (faoliyat turlari bo’yicha)", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(2,"60110900", "Xorijiy til va adabiyoti (tillar bo’yicha)", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(4,"60410100", "Iqtisodiyot (tarmoqlar va sohalar bo’yicha)", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(5,"60110700",  "O’zbek tili va adabiyoti", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(6,"60220300",  "Tarix (mamlakatlar va yo'nalishlar bo’yicha)", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(7,"60110600",  "Musiqa ta'limi", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(8,"60110200",  "Maktabgacha ta`lim", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(9,"60110400", "Boshlang'ich ta`lim", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(10,"60111200", "Jismoniy madaniyat", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(11,"60111100", "Milliy g’oya, ma’naviyat asoslari va huquq ta’limi", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(12,"60610100",  "Kompyuter ilmlari va dasturlash texnologiyalari (yo’nalishlar bo’yicha)", educationTypeRepo.findById(1).orElse(null)),
                     new Faculty(13,"61010100", "Turizm (faoliyat yo’nalishlari bo’yicha)", educationTypeRepo.findById(1).orElse(null))
            );
            facultyRepo.saveAll(faculties);
        }

        Optional<User> userByPhone = userRepo.findByPhone(adminPhone);
        saveUser(adminPhone, userByPhone);

    }



    private void saveUser(String adminPhone, Optional<User> userByPhone) {
        if (userByPhone.isEmpty()) {
            User user = User.builder()
                    .phone(adminPhone)
                    .password(passwordEncoder.encode("00000000"))
                    .roles(List.of(roleRepo.findByName(UserRoles.ROLE_ADMIN)))
                    .build();
            userRepo.save(user);
        }
    }

    private List<Role> saveRoles() {
        return roleRepo.saveAll(List.of(
                new Role(1, UserRoles.ROLE_ADMIN),
                new Role(2, UserRoles.ROLE_STUDENT),
                new Role(3, UserRoles.ROLE_COMPANY),
                new Role(4, UserRoles.ROLE_USER)
        ));
    }


}
    